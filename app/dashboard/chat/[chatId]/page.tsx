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

  // Get convex client and fetch chat and messages
  const convex = getConvexClient();
  const initialMessages = await convex.query(api.messages.list, { chatId });

  return <div>{chatId}</div>;
}

export default ChatPage;
