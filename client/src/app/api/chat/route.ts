import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { experimental_createMCPClient as createMcpClient } from "ai";

export async function POST(req: NextRequest) {
  const mcpClient = await createMcpClient({
    transport: {
      type: "sse",
      url: process.env.NEXT_PUBLIC_MCP_URL ?? "http://localhost:3001/sse",
    },
  });

  try {
    const { messages } = await req.json();
    const tools = await mcpClient.tools();

    const result = streamText({
      model: google("gemini-2.0-flash-lite"),
      messages,
      tools,
      onFinish: () => {
        mcpClient.close();
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json({ error: 'リクエストの処理中にエラーが発生しました' }, { status: 500 });
  }
}
