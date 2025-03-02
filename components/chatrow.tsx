"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Chat } from "@/convex/chats";
import { NavigationContext } from "@/lib/context/navigation";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Button } from "./ui/button";

interface ChatRowProps {
  chat: Chat;
  onDelete: (id: Id<"chats">) => void;
}

export const ChatRow = ({ chat, onDelete }: ChatRowProps) => {
  // Implement Hooks react
  const router = useRouter();
  const { closeMobileNav } = use(NavigationContext);

  const handleClick = () => {
    router.push(`/dashboard/chat/${chat._id}`);
    closeMobileNav();
  };

  return (
    <div
      className="group rounded-xl border border-gray-200/30 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          Chat
          <Button>
            <TrashIcon className="size-4 text-gray-400 hover:text-red-500 transition-colors duration-300" />
          </Button>
        </div>
        {/* Last Message */}

        {/* {lastMessage && <p></p>} */}
      </div>
    </div>
  );
};
