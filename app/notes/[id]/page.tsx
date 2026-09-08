"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Pencil, Trash2, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteDialog } from "@/components/notes/delete-dialog";
import { NoteForm } from "@/components/notes/note-form";
import { GenerateStudyButton } from "@/components/notes/generate-study-button";
import { formatDate } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { fadeIn } from "@/lib/animations";
import { useRouter } from "next/navigation";

interface NotePageProps {
    params: Promise<{ id: string }>;
}

export default function NotePage({ params }: NotePageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const noteId = resolvedParams.id as Id<"notes">;
    const note = useQuery(api.notes.get, { id: noteId });
    const subjects = useQuery(api.subjects.list) ?? [];
    const toggleStatus = useMutation(api.notes.toggleStatus);
    const removeNote = useMutation(api.notes.remove);

    const [editing, setEditing] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const subjectName =
        note?.subjectId ? subjects.find((s) => s._id === note.subjectId)?.name : undefined;

    if (note === undefined) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (note === null) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <Card>
                    <CardContent className="p-10 text-center">
                        <p className="text-sm text-muted-foreground">Note not found.</p>
                        <Button className="mt-4" variant="outline">
                            <Link href="/notes">Back to notes</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleToggle = async () => {
        try {
            await toggleStatus({ id: note._id });
            toast(note.status === "active" ? "Marked as completed" : "Marked as active");
        } catch (err) {
            toast((err as Error).message || "Failed to update", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await removeNote({ id: note._id });
            toast("Note deleted");
            router.push("/notes");
            router.refresh();
        } catch (err) {
            toast((err as Error).message || "Failed to delete", "error");
        }
    };

    if (editing) {
        return (
            <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8"
            >
                <h1 className="text-2xl font-semibold tracking-tight">Edit note</h1>
                <div className="mt-6">
                    <NoteForm
                        subjects={subjects}
                        initial={{
                            id: note._id,
                            title: note.title,
                            content: note.content,
                            subjectId: note.subjectId,
                        }}
                    />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6"
        >
            <Button variant="ghost" size="sm" className="-ml-2">
                <Link href="/notes">
                    <ArrowLeft className="h-4 w-4" />
                    Back to notes
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-xl wrap-break-word">{note.title}</CardTitle>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="truncate">{subjectName ?? "No subject"}</span>
                                <span aria-hidden="true">·</span>
                                <span>Updated {formatDate(note.updatedAt)}</span>
                            </div>
                        </div>
                        <Badge variant={note.status === "completed" ? "default" : "secondary"} className="shrink-0">
                            {note.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed wrap-break-word">
                        {note.content || <span className="text-muted-foreground">No content</span>}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={note.status}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Button variant="outline" size="sm" onClick={handleToggle}>
                                    {note.status === "completed" ? (
                                        <>
                                            <Circle className="h-3.5 w-3.5" />
                                            Mark active
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Mark completed
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </AnimatePresence>
                        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
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

            <GenerateStudyButton
                noteId={note._id}
                title={note.title}
                content={note.content}
            />

            <DeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete note?"
                description="This action cannot be undone. The note will be permanently removed."
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </motion.div>
    );
}