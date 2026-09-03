"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { Logo } from "./logo";
import { useSidebar } from "@/lib/hooks/use-sidebar";

export function MobileNav() {
    const { isOpen, toggle } = useSidebar();

    return (
        <AnimatePresence>
            {!isOpen && (
                <motion.header
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 overflow-hidden"
                >
                    <button
                        onClick={toggle}
                        className="rounded-md p-2 hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                        aria-label="Open menu"
                        aria-expanded={isOpen}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <Logo linkTo="" />
                    </div>
                </motion.header>
            )}
        </AnimatePresence>
    );
} 