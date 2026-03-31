import { OpenRouter } from "@openrouter/sdk";
import { NextRequest } from "next/server";
import { Prisma } from "@/app/generated/prisma/browser";
import "dotenv/config";

const openrouter = new OpenRouter({
  apiKey: process.env["OPENROUTER_API_KEY"],
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // 1. First AI call (with tool definition)
    const response = await openrouter.chat.send({
      chatGenerationParams: {
        model: "stepfun/step-3.5-flash:free",
        messages: [
          {
            role: "user",
            content: "You are a stock manager. Help manage inventory.",
          },
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "check_stock",
              description: "Get current stock levels for a product",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Product name (e.g. 'milk')",
                  },
                },
                required: ["name"],
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

    // 2. Handle tool call
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);

      // Query database
      const product = await prisma.product.findFirst({
        where: {
          name: {
            contains: args.name,
            mode: "insensitive",
          },
        },
      });

      const toolResult = product
        ? `Found: ${product.name}, Quantity: ${product.quantity}, Threshold: ${product.minThreshold}`
        : "Product not found in database.";

      // 3. Second AI call (final response)
      const finalResponse = await openrouter.chat.send({
        chatGenerationParams: {
          model: "stepfun/step-3.5-flash:free",
          messages: [
            {
              role: "system",
              content: "You are a stock manager. Help manage inventory.",
            },
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

    // 4. If no tool call
    return Response.json(message);

  } catch (error) {
    console.error("API ERROR:", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}