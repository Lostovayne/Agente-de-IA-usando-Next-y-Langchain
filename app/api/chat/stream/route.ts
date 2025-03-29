import { getConvexClient } from "@/lib/convex";
import { ChatRequestBody, SSE_DATA_PREFIX, SSE_LINE_DELIMITER, StreamMessage, StreamMessageType } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function sendSSEMessage(writer: WritableStreamDefaultWriter<Uint8Array>, data: StreamMessage) {
  const encoder = new TextEncoder();
  return writer.write(encoder.encode(`${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`));
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = (await request.json()) as ChatRequestBody;
    const { messages, newMessage, chatId } = body;
    const convex = getConvexClient();

    //* Create stream with larger queue strategy for better performance
    const stream = new TransformStream({}, { highWaterMark: 1024 });
    const writer = stream.writable.getWriter();

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

    //? Send the initial message to the client
    const startStream = async () => {
      try {
        //* Send initial connection stableshed message
        await sendSSEMessage(writer, { type: StreamMessageType.Connected });
      } catch (error) {
        console.error("Error in chat Api: ", error);
        return NextResponse.json({ error: "Failed to process chat request" } as const, { status: 500 });
      }
    };
    startStream();
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process chat request" } as const, { status: 500 });
  }
}
