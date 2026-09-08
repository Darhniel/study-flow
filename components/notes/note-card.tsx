"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteDialog } from "./delete-dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { staggerItem } from "@/lib/animations";

interface NoteCardProps {
    note: {
        _id: Id<"notes">;
        title: string;
        content: string;
        subjectName?: string;
        status: "active" | "completed";
        updatedAt: number;
    };
    onDeleted?: () => void;
}

export function NoteCard({ note, onDeleted }: NoteCardProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const toggleStatus = useMutation(api.notes.toggleStatus);
    const removeNote = useMutation(api.notes.remove);

    const preview =
        note.content.length > 120
            ? note.content.slice(0, 120).trim() + "…"
            : note.content;

    const handleToggle = async () => {
        try {
            await toggleStatus({ id: note._id });
            toast(
                note.status === "active"
                    ? "Note marked as completed"
                    : "Note marked as active"
            );
        } catch (err) {
            toast((err as Error).message || "Failed to update note", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await removeNote({ id: note._id });
            toast("Note deleted");
            setDeleteOpen(false);
            onDeleted?.();
        } catch (err) {
            toast((err as Error).message || "Failed to delete note", "error");
        }
    };

    return (
        <>
            <motion.div variants={staggerItem} layout>
                <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <Link
                                    href={`/notes/${note._id}`}
                                    className="text-sm font-semibold hover:text-primary transition-colors line-clamp-1"
                                >
                                    {note.title}
                                </Link>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>{note.subjectName ?? "No subject"}</span>
                                    <span aria-hidden="true">·</span>
                                    <span>Updated {formatDate(note.updatedAt)}</span>
                                </div>
                            </div>
                            <Badge variant={note.status === "completed" ? "default" : "secondary"}>
                                {note.status}
                            </Badge>
                        </div>

                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                            {preview || "No content"}
                        </p>

                        <div className="mt-4 flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleToggle} aria-label="Toggle status">
                                {note.status === "completed" ? (
                                    <>
                                        <Circle className="h-3.5 w-3.5" />
                                        Mark active
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Complete
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" size="sm">
                                <Link href={`/notes/${note._id}`} className="flex items-center gap-2">
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteOpen(true)}
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <DeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete note?"
                description="This action cannot be undone. The note will be permanently removed."
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </>
    );
}