"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubjectsList } from "@/components/subjects/subjects-list";
import { SubjectDialog } from "@/components/subjects/subject-dialog";
import { DeleteDialog } from "@/components/notes/delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { fadeIn } from "@/lib/animations";

export default function SubjectsPage() {
    const subjects = useQuery(api.subjects.listWithStats);
    const removeSubject = useMutation(api.subjects.remove);

    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const isLoading = subjects === undefined;

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await removeSubject({ id: deleteTarget as any });
            toast("Subject deleted");
            setDeleteTarget(null);
        } catch (err) {
            toast((err as Error).message || "Failed to delete subject", "error");
        }
    };

    return (
        <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
                    <p className="text-sm text-muted-foreground">
                        Organize your notes by topic.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    New Subject
                </Button>
            </div>

            <div className="mt-6">
                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="rounded-lg border p-5 space-y-3">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <SubjectsList subjects={subjects} />
                )}
            </div>

            <SubjectDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                mode="create"
            />

            <DeleteDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete subject?"
                description="This will permanently delete this subject. This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </motion.div>
    );
}