"use client";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { createSSEParser } from "@/lib/createSSEParser";
import { ChatRequestBody, StreamMessageType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

interface ChatInterfaceProps {
  chatId: Id<"chats">;
  initialMessages: Doc<"messages">[];
}

export const ChatInterface = ({ chatId, initialMessages }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [streamedResponse, setStreamedResponse] = useState<string>("");
  const [currentTool, setCurrentTool] = useState<{ name: string; input: unknown } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: string) => Promise<void>
  ) => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await onChunk(new TextDecoder().decode(value));
      }
    } finally {
      reader.releaseLock();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Reset UI State for new message
    setInput("");
    setStreamedResponse("");
    setCurrentTool(null);
    setIsLoading(true);

    //* Add users message immediately for better UX
    const optimisticUserMessage: Doc<"messages"> = {
      _id: `temp_${Date.now()}`,
      chatId,
      content: trimmedInput,
      role: "user",
      createdAt: Date.now(),
      _creationTime: Date.now(),
    } as unknown as Doc<"messages">;
    setMessages((prev) => [...prev, optimisticUserMessage]);

    //* Track complete response for saving database
    let fullResponse = "";

    //* Start Streaming Response
    try {
      const requestBody: ChatRequestBody = {
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        newMessage: trimmedInput,
        chatId,
      };

      //* Initialize SSE Connection
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error(await response.text());
      if (!response.ok) throw new Error("No response body available");

      //* Handle the stream
      //* Create SSE a parser and stream reader
      const parser = createSSEParser();
      const reader = response.body?.getReader();
      //* Process the stream
      if (!reader) throw new Error("No response body reader available");
      await processStream(reader, async (chunk) => {
        const messages = parser.parse(chunk);

        //* Handle each message
        for (const message of messages) {
          switch (message.type) {
            case StreamMessageType.Token:
              if ("token" in message) {
                fullResponse += message.token;
                setStreamedResponse(fullResponse);
              }
              break;

            case StreamMessageType.ToolStart:
              if ("tool" in message) {
                setCurrentTool({
                  name: message.tool,
                  input: message.input,
                });
                fullResponse += formatTerminalIutput(message.tool, message.input, "Processing...");
                setStreamedResponse(fullResponse);
              }
              break;

            case StreamMessageType.ToolEnd:
              if ("tool" in message && currentTool) {
                //* Remplace el processing with menssage output
                const lastTerminalIndex = fullResponse.lastIndexOf("<div class='bg-[#1e1e1e]'");
                if (lastTerminalIndex !== -1) {
                  fullResponse = fullResponse.substring(0, lastTerminalIndex);
                  fullResponse += formatTerminalIutput(message.tool, message.input, message.output);
                  setStreamedResponse(fullResponse);
                }
                setCurrentTool(null);
              }
              break;
            case StreamMessageType.Error:
              if ("error" in message) {
                throw new Error(message.error);
              }
              break;
          }
        }
      });

      if (!reader) throw new Error("No response body reader available");
    } catch (error) {
      console.error("Error streaming response:", error);
      //* Remove optimistic message
      setMessages((prev) => prev.filter((message) => message._id !== optimisticUserMessage._id));
      setStreamedResponse("Error streaming response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <main className="flex flex-col h-[calc(100vh-(--spacing(14)))]">
        {/* Messages */}
        <section className="bg-red-50 flex-1">
          <div>
            {/* Previous Messages */}
            {messages.map((message) => (
              <div key={message._id}>{message.content}</div>
            ))}

            {/* Last Message */}
            <div ref={messagesEndRef} />
          </div>
        </section>

        {/* footer */}
        <footer className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Ai Agent..."
                className="flex-1 py-3 rounded-2xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-sm pl-2 pr-12 bg-gray-50 placeholder:text-gray-500"
              />
              <Button
                className={cn(
                  "absolute right-1.5 rounded-xl size-9 p-0 flex items-center justify-center transition-all",
                  input.trim()
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    : "bg-gray-100 text-gray-400"
                )}
                type="submit"
                disabled={isLoading || !input.trim()}
              >
                <ArrowRight />
              </Button>
            </div>
          </form>
        </footer>
      </main>
    </div>
  );
};
