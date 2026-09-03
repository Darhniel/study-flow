"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { Id } from "@/convex/_generated/dataModel";

interface RecentNote {
    _id: Id<"notes">;
    title: string;
    subjectName?: string;
    status: "active" | "completed";
    updatedAt: number;
}

interface RecentNotesProps {
    notes: RecentNote[];
}

export function RecentNotes({ notes }: RecentNotesProps) {
    if (notes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recently updated</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No notes yet. Create your first note to get started.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recently updated</CardTitle>
            </CardHeader>
            <CardContent>
                <motion.ul
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="divide-y"
                >
                    {notes.map((note) => (
                        <motion.li key={note._id} variants={staggerItem}>
                            <Link
                                href={`/notes/${note._id}`}
                                className="flex items-center justify-between py-3 hover:text-primary transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{note.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {note.subjectName ?? "No subject"} · Updated {formatDate(note.updatedAt)}
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