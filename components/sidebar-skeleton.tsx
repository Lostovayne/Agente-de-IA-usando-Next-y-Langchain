"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";

export const SidebarSkeleton = () => {
  return (
    <>
      {/* Background Overlay for Mobile Nav */}
      {/* <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" /> */}
      <div
        className={cn(
          "fixed md:inset-y-0 top-14 bottom-0 left-0 z-50 w-72 bg-gray-50/80 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:top-0 flex flex-col",
          "translate-x-0"
        )}
      >
        <div className="p-4 border-b border-gray-200/50">
          <Button
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/50 shadow-xs hover:shadow-sm transition-all duration-200 animate-pulse"
            disabled
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Cargando...
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2.5 p-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200/30 bg-white/50 backdrop-blur-xs animate-pulse h-[73px]"
            />
          ))}
        </div>
      </div>
    </>
  );
};
