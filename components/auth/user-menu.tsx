"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

export function UserMenu() {
    const { isLoading, isAuthenticated } = useConvexAuth();

    if (isLoading || !isAuthenticated) {
        return null;
    }

    return <UserMenuContent />;
}

function UserMenuContent() {
    const { signOut } = useAuthActions();
    const [open, setOpen] = useState(true);
    const user = useQuery(api.users.viewer);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (!user) return null;

    return (
        <div className="relative">
            <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="mt-2 z-50 w-48 rounded-md border bg-background shadow-lg"
                role="menu"
            >
                <div className="p-3 border-b">
                    <p className="text-sm font-medium truncate hover:overflow-visible">{user.email}</p>
                    {user.name && (
                        <p className="text-xs text-muted-foreground truncate">{user.name}</p>
                    )}
                </div>
                <button
                    onClick={() => {
                        signOut();
                        setOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors cursor-pointer"
                    role="menuitem"
                >
                    <LogOut className="h-4 w-4" />
                    Sign out
                </button>
            </motion.div>
        </div>
    );
}