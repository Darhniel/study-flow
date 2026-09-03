"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { Id } from "@/convex/_generated/dataModel";

interface NoteWithMaterial {
    _id: Id<"notes">;
    title: string;
    status: "active" | "completed";
    materialCreatedAt: number;
}

interface RecentAIMaterialProps {
    notes: NoteWithMaterial[];
}

export function RecentAIMaterial({ notes }: RecentAIMaterialProps) {
    if (notes.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    Recent AI study material
                </CardTitle>
            </CardHeader>
            <CardContent>
                <motion.ul
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2"
                >
                    {notes.map((note) => (
                        <motion.li key={note._id} variants={staggerItem}>
                            <Link
                                href={`/notes/${note._id}`}
                                className="flex items-center justify-between py-2 hover:text-primary transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{note.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Generated {formatDate(note.materialCreatedAt)}
                                    </p>
                                </div>
                                <Badge variant={note.status === "completed" ? "default" : "secondary"} className="ml-2">
                                    {note.status}
                                </Badge>
                            </Link>
                        </motion.li>
                    ))}
                </motion.ul>
            </CardContent>
        </Card>
    );
}