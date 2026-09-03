"use client";

import { motion } from "framer-motion";
import { BookOpen, Lightbulb, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizQuestion } from "./quiz-question";
import type { StudyMaterial } from "@/lib/gemini-validation";
import { formatDate } from "@/lib/utils";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations";

interface StudyMaterialViewProps {
    material: StudyMaterial;
    createdAt: number;
    onRegenerate: () => void;
    isRegenerating: boolean;
}

export function StudyMaterialView({
    material,
    createdAt,
    onRegenerate,
    isRegenerating,
}: StudyMaterialViewProps) {
    return (
        <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold tracking-tight">Study material</h2>
                    <p className="text-xs text-muted-foreground">
                        Generated {formatDate(createdAt)}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                    className="shrink-0"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Regenerate</span>
                </Button>
            </div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                <motion.div variants={staggerItem}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed wrap-break-word">{material.summary}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                                Key points
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-2">
                                {material.keyPoints.map((point, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                        <span className="shrink-0 text-muted-foreground font-medium">
                                            {i + 1}.
                                        </span>
                                        <span className="wrap-break-word">{point}</span>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                Quiz
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {material.quizQuestions.map((q, i) => (
                                    <QuizQuestion
                                        key={i}
                                        index={i}
                                        question={q.question}
                                        answer={q.answer}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}