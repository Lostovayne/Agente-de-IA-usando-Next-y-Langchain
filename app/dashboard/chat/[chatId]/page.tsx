import ChatInterface from "@/components/chat-interface";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


interface ChatPageParams {
  params: Promise<{ chatId: Id<"chats"> }>;
}

async function ChatPage({ params }: ChatPageParams) {
  const { chatId } = await params;
  // Get user authenticated
  const user = await auth();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    // Get convex client and fetch chat and messages
    const convex = getConvexClient();
    const initialMessages = await convex.query(api.messages.list, { chatId });

    return (
      <div className="flex-1 overflow-hidden">
        <ChatInterface initialMessages={initialMessages} chatId={chatId} />
      </div>
    );
  } catch (error) {
    console.log(`Error fetching chat: ${error}`);
    redirect("/dashboard");
  }
}

export default ChatPage;
