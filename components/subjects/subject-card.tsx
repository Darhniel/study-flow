"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookMarked, CheckCircle2, Calendar, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteDialog } from "@/components/notes/delete-dialog";
import { SubjectDialog } from "./subject-dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { staggerItem } from "@/lib/animations";
import type { Id } from "@/convex/_generated/dataModel";

interface SubjectCardProps {
    subject: {
        _id: Id<"subjects">;
        name: string;
        noteCount: number;
        completedCount: number;
        lastUpdated: number | null;
    };
    onDeleted?: () => void;
    onRenamed?: () => void;
}

export function SubjectCard({ subject, onDeleted, onRenamed }: SubjectCardProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [renameOpen, setRenameOpen] = useState(false);

    return (
        <>
            <motion.div variants={staggerItem} layout>
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                            <Link
                                href={`/subjects/${subject._id}`}
                                className="flex-1 min-w-0"
                            >
                                <h3 className="text-sm font-semibold hover:text-primary transition-colors truncate">
                                    {subject.name}
                                </h3>
                            </Link>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setRenameOpen(true)}
                                    aria-label="Rename subject"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteOpen(true)}
                                    aria-label="Delete subject"
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <BookMarked className="h-3.5 w-3.5" />
                                <span>{subject.noteCount} notes</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{subject.completedCount} completed</span>
                            </div>
                        </div>

                        {subject.lastUpdated && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Updated {formatDate(subject.lastUpdated)}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <SubjectDialog
                open={renameOpen}
                onOpenChange={setRenameOpen}
                mode="rename"
                subjectId={subject._id}
                initialValue={subject.name}
                onSuccess={() => {
                    toast("Subject renamed");
                    onRenamed?.();
                }}
            />

            <DeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete subject?"
                description={`This will permanently delete "${subject.name}". This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={async () => {
                    try {
                        const { remove } = await import("@/convex/_generated/api").then(
                            (m) => m.api.subjects
                        );
                        const { useMutation } = await import("convex/react");
                        // This is handled by the parent component
                        setDeleteOpen(false);
                        onDeleted?.();
                    } catch (err) {
                        toast((err as Error).message || "Failed to delete subject", "error");
                    }
                }}
            />
        </>
    );
}