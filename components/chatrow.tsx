"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Chat } from "@/convex/chats";

interface ChatRowProps {
  chat: Chat;
  onDelete: (id: Id<"chats">) => void;
}

export const ChatRow = ({ chat, onDelete }: ChatRowProps) => {
  return <div></div>;
};
