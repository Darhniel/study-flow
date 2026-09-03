"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/lib/toast";

interface Subject {
    _id: Id<"subjects">;
    name: string;
}

interface NoteFormProps {
    initial?: {
        id: Id<"notes">;
        title: string;
        content: string;
        subjectId?: Id<"subjects">;
    };
    subjects: Subject[];
}

interface FormErrors {
    title?: string;
    content?: string;
}

export function NoteForm({ initial, subjects }: NoteFormProps) {
    const router = useRouter();
    const createNote = useMutation(api.notes.create);
    const updateNote = useMutation(api.notes.update);

    const [title, setTitle] = useState(initial?.title ?? "");
    const [content, setContent] = useState(initial?.content ?? "");
    const [subjectId, setSubjectId] = useState<string>(initial?.subjectId ?? "");
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const validate = (): boolean => {
        const next: FormErrors = {};
        if (!title.trim()) next.title = "Title is required";
        if (!content.trim()) next.content = "Content is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                content: content.trim(),
                subjectId: (subjectId as Id<"subjects">) || undefined,
            };
            if (initial) {
                await updateNote({ id: initial.id, ...payload });
                toast("Note updated");
            } else {
                await createNote(payload);
                toast("Note created");
            }
            router.push("/notes");
            router.refresh();
        } catch (err) {
            toast((err as Error).message || "Failed to save note", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (initial) {
            router.push(`/notes/${initial.id}`);
        } else {
            router.push("/notes");
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Biology Chapter 3"
                            aria-invalid={errors.title ? "true" : undefined}
                            aria-describedby={errors.title ? "title-error" : undefined}
                            className="mt-1"
                        />
                        {errors.title && (
                            <p id="title-error" className="mt-1 text-xs text-destructive" role="alert">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="subject">Subject</Label>
                        <select
                            id="subject"
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">No subject</option>
                            {subjects.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your notes here…"
                            aria-invalid={errors.content ? "true" : undefined}
                            aria-describedby={errors.content ? "content-error" : undefined}
                            className="mt-1"
                        />
                        {errors.content && (
                            <p id="content-error" className="mt-1 text-xs text-destructive" role="alert">
                                {errors.content}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Saving…" : initial ? "Save changes" : "Create note"}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}