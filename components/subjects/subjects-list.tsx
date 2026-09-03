"use client";

import { motion } from "framer-motion";
import type { Id } from "@/convex/_generated/dataModel";
import { SubjectCard } from "./subject-card";
import { EmptyState } from "@/components/notes/empty-state";
import { staggerContainer } from "@/lib/animations";

interface SubjectItem {
    _id: Id<"subjects">;
    name: string;
    noteCount: number;
    completedCount: number;
    lastUpdated: number | null;
}

interface SubjectsListProps {
    subjects: SubjectItem[];
    onSubjectDeleted?: () => void;
    onSubjectRenamed?: () => void;
}

export function SubjectsList({
    subjects,
    onSubjectDeleted,
    onSubjectRenamed,
}: SubjectsListProps) {
    if (subjects.length === 0) {
        return (
            <EmptyState
                title="No subjects yet"
                description="Create your first subject to start organizing your notes."
                actionLabel="Create subject"
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
            {subjects.map((subject) => (
                <SubjectCard
                    key={subject._id}
                    subject={subject}
                    onDeleted={onSubjectDeleted}
                    onRenamed={onSubjectRenamed}
                />
            ))}
        </motion.div>
    );
}