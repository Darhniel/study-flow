"use client"
import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { SidebarContext } from "@/lib/hooks/use-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useConvexAuth } from "@convex-dev/auth/react";

interface AppShellProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ["/login", "/signup"];

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const open = () => setSidebarOpen(true);
  const close = () => setSidebarOpen(false);
  const toggle = () => setSidebarOpen((prev) => !prev);

  const { isLoading, isAuthenticated } = useConvexAuth();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const shouldRenderContent = !isLoading && (isAuthenticated || isPublicRoute);

  return (
    <SidebarContext.Provider value={{ isOpen: sidebarOpen, open, close, toggle }}>
      {shouldRenderContent ? (
        <div className="min-h-screen bg-background">
          <Sidebar />
          <div className="lg:pl-60 transition-all duration-300">
            <MobileNav />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="space-y-4 w-full max-w-md px-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )}
    </SidebarContext.Provider>
  );
}