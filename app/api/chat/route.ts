import { OpenRouter } from "@openrouter/sdk";
import { NextRequest } from "next/server";
import { Prisma } from "@/app/generated/prisma/browser";
import "dotenv/config";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    //  SYSTEM PROMPT 
    const systemPrompt = `
You are an intelligent stock manager AI.

RULES:
- ALWAYS use the "check_stock" tool when asked about inventory or stock.
- NEVER guess stock values.
- You can check multiple products if needed.

AFTER receiving tool data:
- Compare quantity with threshold
- If quantity < threshold → "Low stock"
- If quantity >= threshold → "Stock is sufficient"
- Suggest actions (e.g., reorder, monitor, restock amount)

Be short, clear, and helpful.
`;

    // FIRST CALL (TOOL DECISION)
    const response = await openrouter.chat.send({
      chatGenerationParams: {
        model: "stepfun/step-3.5-flash:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "check_stock",
              description: "Get stock levels for one or more products",
              parameters: {
                type: "object",
                properties: {
                  names: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of product names (e.g. ['milk', 'bread'])",
                  },
                },
                required: ["names"],
              },
            },
          },
        ],
        tool_choice: "auto",
      },
    });

    const message = response.choices?.[0]?.message;

    if (!message) {
      return Response.json({ error: "No response from AI" }, { status: 500 });
    }

    //  2 HANDLE TOOL CALL
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);

      const results = [];

      for (const name of args.names) {
        const product = await prisma.product.findFirst({
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
        });

        if (product) {
          results.push({
            name: product.name,
            quantity: product.quantity,
            threshold: product.minThreshold,
          });
        } else {
          results.push({
            name,
            error: "Not found",
          });
        }
      }

      const toolResult = JSON.stringify(results);

      // 3 FINAL AI RESPONSE (REASONING)
      const finalResponse = await openrouter.chat.send({
        chatGenerationParams: {
          model: "stepfun/step-3.5-flash:free",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            message,
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content: toolResult,
            },
          ],
        },
      });

      return Response.json(finalResponse.choices?.[0]?.message);
    }

    // NO TOOL USED
    return Response.json(message);

  } catch (error) {
    console.error("API ERROR:", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}