"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { subscribeToast, type ToastMessage } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        return subscribeToast((t) => {
            setToasts((prev) => [...prev, t]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((p) => p.id !== t.id));
            }, 3000);
        });
    }, []);

    const dismiss = (id: number) => {
        setToasts((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div
            aria-live="polite"
            aria-atomic="true"
            className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm"
        >
            <AnimatePresence>
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        role="status"
                        className={cn(
                            "flex items-start gap-3 rounded-lg border bg-background p-4 shadow-md",
                            t.type === "error" && "border-destructive/50"
                        )}
                    >
                        {t.type === "success" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        )}
                        <p className="flex-1 text-sm">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Dismiss"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}