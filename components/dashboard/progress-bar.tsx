"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
    completed: number;
    total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Study progress</span>
                <span className="text-muted-foreground">
                    {completed} / {total} {total === 1 ? "note" : "notes"}
                </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className="h-full rounded-full bg-primary"
                />
            </div>
            {total > 0 && (
                <p className="text-xs text-muted-foreground">
                    {Math.round(percentage)}% complete
                </p>
            )}
        </div>
    );
}