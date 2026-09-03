import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { SidebarContext } from "@/lib/hooks/use-sidebar";
import { AuthGate } from "@/components/auth/auth-gate";
import { UserMenu } from "@/components/auth/user-menu";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const open = () => setSidebarOpen(true);
  const close = () => setSidebarOpen(false);
  const toggle = () => setSidebarOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isOpen: sidebarOpen, open, close, toggle }}>
      <AuthGate>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <div className="lg:pl-60">
            <MobileNav />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </AuthGate>
    </SidebarContext.Provider>
  );
}