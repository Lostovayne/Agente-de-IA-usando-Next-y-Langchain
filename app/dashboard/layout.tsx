"use client";

import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { SidebarSkeleton } from "@/components/sidebar-skeleton";
import { NavigationProvider } from "@/lib/context/navigation";
import { Authenticated, AuthLoading } from "convex/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      <div className="flex h-screen">
        <Authenticated>
          <Sidebar />
        </Authenticated>
        <AuthLoading>
          <SidebarSkeleton />
        </AuthLoading>
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </NavigationProvider>
  );
}
