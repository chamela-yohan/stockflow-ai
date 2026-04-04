import { OpenRouter } from "@openrouter/sdk";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import "dotenv/config";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

const systemPrompt = `
You are an intelligent stock manager AI.

TOOLS AVAILABLE:
- "check_stock": Use when the user asks about SPECIFIC products by name.
- "get_low_stock": Use when the user asks about low stock, what needs restocking, critical items, or a full inventory scan.

RULES:
- NEVER guess stock values. Always use a tool.
- After receiving tool data, analyze and respond clearly.

RESPONSE FORMAT:
- Use **bold** for product names and quantities
- Use ⚠️ for low stock items, ✅ for sufficient stock
- Keep responses concise with clear action suggestions
`;

const tools = [
  {
    type: "function",
    function: {
      name: "check_stock",
      description:
        "Get stock levels for one or more specific products by name. Use when user mentions specific product names.",
      parameters: {
        type: "object",
        properties: {
          names: {
            type: "array",
            items: { type: "string" },
            description: "List of product names e.g. ['milk', 'bread']",
          },
        },
        required: ["names"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_low_stock",
      description:
        "Get ALL products currently below their minimum stock threshold. Use when user asks about low stock, critical items, or what needs restocking — without naming specific products.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // FIRST CALL — let model decide which tool (if any) to use
    const response = await openrouter.chat.send({
      chatGenerationParams: {
        model: MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools,
        toolChoice: "auto",
      },
    });

    const message = response.choices?.[0]?.message;

    if (!message) {
      return Response.json({ error: "No response from AI" }, { status: 500 });
    }

    // HANDLE TOOL CALL
    if (message.toolCalls && message.toolCalls.length > 0) {
      const toolCall = message.toolCalls[0];
      const toolName = toolCall.function.name;
      let results: object[] = [];

      if (toolName === "check_stock") {
        //  Fetch specific products by name 
        const args = JSON.parse(toolCall.function.arguments);

        for (const name of args.names) {
          const product = await prisma.product.findFirst({
            where: { name: { contains: name, mode: "insensitive" } },
          });

          results.push(
            product
              ? {
                  name: product.name,
                  quantity: product.quantity,
                  threshold: product.minThreshold,
                }
              : { name, error: "Product not found" }
          );
        }
      } else if (toolName === "get_low_stock") {
        //  Fetch ALL products below their threshold 
        const all = await prisma.product.findMany();
        const low = all.filter((p) => p.quantity < p.minThreshold);

        results =
          low.length > 0
            ? low.map((p) => ({
                name: p.name,
                quantity: p.quantity,
                threshold: p.minThreshold,
                deficit: p.minThreshold - p.quantity,
              }))
            : [{ message: "All products are sufficiently stocked. ✅" }];
      }

      // Reconstruct assistant message in SDK camelCase format
      const assistantMessage = {
        role: "assistant" as const,
        content: message.content ?? null,
        toolCalls: message.toolCalls, // ✅ camelCase — matches SDK schema
      };

      // FINAL CALL — send tool result back for reasoning
      const finalResponse = await openrouter.chat.send({
        chatGenerationParams: {
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            assistantMessage,
            {
              role: "tool" as const,
              toolCallId: toolCall.id, // ✅ camelCase
              content: JSON.stringify(results),
            },
          ],
        },
      });

      const finalMessage = finalResponse.choices?.[0]?.message;

      if (!finalMessage?.content) {
        return Response.json(
          { error: "AI did not return a final response. Try rephrasing." },
          { status: 500 }
        );
      }

      return Response.json(finalMessage);
    }

    // NO TOOL USED — simple conversational reply
    return Response.json(message);
  } catch (error) {
    console.error("API ERROR:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}