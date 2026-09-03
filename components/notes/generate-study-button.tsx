"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudyMaterialView } from "./study-material";
import { toast } from "@/lib/toast";
import type { StudyMaterial } from "@/lib/gemini-validation";
import { fadeIn } from "@/lib/animations";

interface GenerateStudyButtonProps {
    noteId: Id<"notes">;
    title: string;
    content: string;
}

interface ApiError {
    error: string;
    code?: string;
}

export function GenerateStudyButton({
    noteId,
    title,
    content,
}: GenerateStudyButtonProps) {
    const existing = useQuery(api.studyMaterials.getByNote, { noteId });
    const saveMaterial = useMutation(api.studyMaterials.save);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasContent = title.trim().length > 0 && content.trim().length > 0;

    const handleGenerate = async () => {
        if (!hasContent) {
            toast("Add a title and content to the note first.", "error");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/generate-study-material", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteId, title, content }),
            });

            const json = (await response.json()) as
                | { ok: true; data: StudyMaterial }
                | ApiError;

            if (!response.ok || !("ok" in json && json.ok)) {
                const err = json as ApiError;
                const message = friendlyErrorMessage(err);
                setError(message);
                toast(message, "error");
                return;
            }

            const data = json.data;
            await saveMaterial({
                noteId,
                summary: data.summary,
                keyPoints: data.keyPoints,
                quizQuestions: data.quizQuestions,
            });
            toast("Study material generated");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to generate study material";
            setError(message);
            toast(message, "error");
        } finally {
            setLoading(false);
        }
    };

    if (existing) {
        return (
            <StudyMaterialView
                material={{
                    summary: existing.summary,
                    keyPoints: existing.keyPoints,
                    quizQuestions: existing.quizQuestions,
                }}
                createdAt={existing.createdAt}
                onRegenerate={handleGenerate}
                isRegenerating={loading}
            />
        );
    }

    return (
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold">AI study material</h3>
                            <p className="mt-1 text-xs text-muted-foreground max-w-md">
                                Generate a summary, key points, and a 5-question quiz from this
                                note using Google Gemini.
                            </p>
                        </div>
                        <Button onClick={handleGenerate} disabled={loading || !hasContent}>
                            <Sparkles
                                className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`}
                            />
                            {loading ? "Generating…" : "Generate Study Material"}
                        </Button>
                    </div>

                    {loading && (
                        <div className="mt-5" role="status" aria-live="polite">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                                    className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
                                    aria-hidden="true"
                                />
                                <span>Analyzing your note with Gemini…</span>
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {error && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm"
                                role="alert"
                            >
                                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">Generation failed</p>
                                    <p className="text-muted-foreground">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function friendlyErrorMessage(err: ApiError): string {
    switch (err.code) {
        case "RATE_LIMIT":
            return "Too many requests. Please wait a moment and try again.";
        case "CONFIG_ERROR":
            return "Gemini is not configured. Please contact the administrator.";
        case "INVALID_RESPONSE":
            return "Gemini returned an unexpected response. Please try again.";
        case "API_ERROR":
            return "Gemini is temporarily unavailable. Please try again later.";
        default:
            return err.error || "Failed to generate study material.";
    }
}