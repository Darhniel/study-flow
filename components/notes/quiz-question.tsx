"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QuizQuestionProps {
    index: number;
    question: string;
    answer: string;
}

export function QuizQuestion({ index, question, answer }: QuizQuestionProps) {
    const [revealed, setRevealed] = useState(false);

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                        {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium wrap-break-word">{question}</p>
                        <div className="mt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRevealed((r) => !r)}
                                aria-expanded={revealed}
                            >
                                {revealed ? (
                                    <>
                                        <EyeOff className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Hide answer</span>
                                        <span className="sm:hidden">Hide</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Show answer</span>
                                        <span className="sm:hidden">Show</span>
                                    </>
                                )}
                            </Button>
                            <AnimatePresence initial={false}>
                                {revealed && (
                                    <motion.div
                                        key="answer"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 rounded-md bg-secondary/50 p-3 text-sm wrap-break-word">
                                            <span className="font-medium text-muted-foreground">Answer: </span>
                                            {answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}