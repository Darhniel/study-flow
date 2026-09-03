"use client";

import * as React from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onOpenChange(false);
        };
        if (open) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [open, onOpenChange]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40"
                        onClick={() => onOpenChange(false)}
                        aria-hidden="true"
                    />
                    {children}
                </>
            )}
        </AnimatePresence>
    );
}

interface SheetContentProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    onClose: () => void;
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
    ({ className, children, onClose, ...props }, ref) => (
        <motion.div
            ref={ref}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r shadow-lg",
                className
            )}
            {...props}
        >
            <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Close menu"
            >
                <X className="h-5 w-5" />
            </button>
            {children}
        </motion.div>
    )
);
SheetContent.displayName = "SheetContent";

export { Sheet, SheetContent };