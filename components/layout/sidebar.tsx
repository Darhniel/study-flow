"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, BookMarked, Settings, LayoutDashboard, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useSidebar } from "@/lib/hooks/use-sidebar";
import { UserMenu } from "@/components/auth/user-menu";
import { useConvexAuth } from "@convex-dev/auth/react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Notes", href: "/notes", icon: BookMarked },
    { label: "Subjects", href: "/subjects", icon: BookOpen },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isOpen, close } = useSidebar();

    const { isLoading, isAuthenticated } = useConvexAuth();

    if (isLoading || !isAuthenticated) {
        return null;
    }

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:border-r bg-background overflow-y-auto"
                style={{ height: "100dvh" }}
                aria-label="Main navigation"
            >
                <div className="flex h-16 items-center justify-between border-b px-6 shrink-0">
                    <Logo />
                    {/* <UserMenu /> */}
                </div>
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive =
                                item.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-secondary text-foreground"
                                                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div className="border-t p-4 shrink-0">
                    <UserMenu />
                </div>
                {/* <div className="border-t p-4 text-xs text-muted-foreground shrink-0">
                    StudyFlow · v0.1
                </div> */}
            </aside>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                            onClick={close}
                            aria-hidden="true"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                            className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-background border-r lg:hidden flex flex-col overflow-y-auto"
                            style={{ height: "100dvh" }}
                            aria-label="Main navigation"
                        >
                            <div className="flex h-16 items-center justify-between border-b px-6 shrink-0">
                                <Logo />
                                <button
                                    onClick={close}
                                    className="rounded-md p-2 hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <nav className="flex-1 overflow-y-auto px-3 py-4">
                                <ul className="space-y-1">
                                    {navItems.map((item) => {
                                        const isActive =
                                            item.href === "/"
                                                ? pathname === "/"
                                                : pathname.startsWith(item.href);
                                        const Icon = item.icon;
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    onClick={close}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                                        isActive
                                                            ? "bg-secondary text-foreground"
                                                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">{item.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                            <div className="border-t p-4 shrink-0">
                                <UserMenu />
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}