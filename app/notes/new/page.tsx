"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NoteForm } from "@/components/notes/note-form";
import { fadeIn } from "@/lib/animations";

export default function NewNotePage() {
    const subjects = useQuery(api.subjects.list) ?? [];

    return (
        <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8"
        >
            <h1 className="text-2xl font-semibold tracking-tight">New note</h1>
            <p className="text-sm text-muted-foreground">
                Capture what you&apos;re learning AI summaries will be available soon.
            </p>

            <div className="mt-6">
                <NoteForm subjects={subjects} />
            </div>
        </motion.div>
    );
}