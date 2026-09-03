"use client";

import { motion } from "framer-motion";
import type { Id } from "@/convex/_generated/dataModel";
import { NoteCard } from "./note-card";
import { EmptyState } from "./empty-state";
import { staggerContainer } from "@/lib/animations";

interface NoteItem {
    _id: Id<"notes">;
    title: string;
    content: string;
    subjectId?: Id<"subjects">;
    subjectName?: string;
    status: "active" | "completed";
    updatedAt: number;
}

interface NotesListProps {
    notes: NoteItem[];
}

export function NotesList({ notes }: NotesListProps) {
    if (notes.length === 0) {
        return (
            <EmptyState
                title="No notes match your filters"
                description="Try adjusting your search or filters, or create a new note."
            />
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
            {notes.map((note) => (
                <NoteCard key={note._id} note={note} />
            ))}
        </motion.div>
    );
}