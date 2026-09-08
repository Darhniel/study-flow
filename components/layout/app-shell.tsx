"use client"
import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { SidebarContext } from "@/lib/hooks/use-sidebar";
import { useConvexAuth } from "@convex-dev/auth/react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const open = () => setSidebarOpen(true);
  const close = () => setSidebarOpen(false);
  const toggle = () => setSidebarOpen((prev) => !prev);

  const { isLoading, isAuthenticated } = useConvexAuth();
  const shouldRenderPadding = isLoading || !isAuthenticated; 

  return (
    <SidebarContext.Provider value={{ isOpen: sidebarOpen, open, close, toggle }}>
      <>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <div className={`${shouldRenderPadding ? "pl-0" : "lg:pl-60"} transition-all duration-300`}>
            <MobileNav />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </>
    </SidebarContext.Provider>
  );
}