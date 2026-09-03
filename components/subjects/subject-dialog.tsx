"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";

interface SubjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "rename";
    subjectId?: Id<"subjects">;
    initialValue?: string;
    onSuccess?: () => void;
}

export function SubjectDialog({
    open,
    onOpenChange,
    mode,
    subjectId,
    initialValue = "",
    onSuccess,
}: SubjectDialogProps) {
    const createSubject = useMutation(api.subjects.create);
    const renameSubject = useMutation(api.subjects.rename);

    const [name, setName] = useState(initialValue);
    const [error, setError] = useState<string | undefined>();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setName(initialValue);
            setError(undefined);
        }
    }, [open, initialValue]);

    const validate = (): boolean => {
        if (!name.trim()) {
            setError("Subject name is required");
            return false;
        }
        setError(undefined);
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            if (mode === "create") {
                await createSubject({ name: name.trim() });
                toast("Subject created");
            } else if (mode === "rename" && subjectId) {
                await renameSubject({ id: subjectId, name: name.trim() });
            }
            onOpenChange(false);
            onSuccess?.();
        } catch (err) {
            const message = (err as Error).message || "Failed to save subject";
            setError(message);
            toast(message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onClose={() => onOpenChange(false)}>
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Create subject" : "Rename subject"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "Add a new subject to organize your notes."
                            : "Update the name of this subject."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="subject-name">Subject name</Label>
                        <Input
                            id="subject-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Mathematics"
                            aria-invalid={error ? "true" : undefined}
                            aria-describedby={error ? "subject-name-error" : undefined}
                            className="mt-1"
                            autoFocus
                        />
                        {error && (
                            <p id="subject-name-error" className="mt-1 text-xs text-destructive" role="alert">
                                {error}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Saving…" : mode === "create" ? "Create" : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}