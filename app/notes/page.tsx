"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotesFilters } from "@/components/notes/notes-filters";
import { NotesList } from "@/components/notes/notes-list";
import { NotesLoading } from "@/components/notes/notes-loading";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { fadeIn } from "@/lib/animations";

export default function NotesPage() {
    const [search, setSearch] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [status, setStatus] = useState("");

    const debouncedSearch = useDebounce(search, 300);

    const subjects = useQuery(api.subjects.list) ?? [];
    const notes = useQuery(api.notes.list, {
        subjectId: (subjectId as Id<"subjects">) || undefined,
        status: (status as "active" | "completed") || undefined,
    });

    const filteredNotes = useMemo(() => {
        if (!notes) return [];
        const trimmed = debouncedSearch.trim().toLowerCase();
        const base = trimmed
            ? notes.filter(
                (n) =>
                    n.title.toLowerCase().includes(trimmed) ||
                    n.content.toLowerCase().includes(trimmed)
            )
            : notes;
        return base.map((n) => {
            const subject = n.subjectId
                ? subjects.find((s) => s._id === n.subjectId)
                : undefined;
            return {
                _id: n._id,
                title: n.title,
                content: n.content,
                subjectId: n.subjectId,
                subjectName: subject?.name,
                status: n.status,
                updatedAt: n.updatedAt,
            };
        });
    }, [notes, debouncedSearch, subjects]);

    return (
        <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
                    <p className="text-sm text-muted-foreground">
                        All your study notes in one place.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/notes/new">
                        <Plus className="h-4 w-4" />
                        New Note
                    </Link>
                </Button>
            </div>

            <div className="mt-6">
                <NotesFilters
                    search={search}
                    onSearchChange={setSearch}
                    subjectId={subjectId}
                    onSubjectChange={setSubjectId}
                    status={status}
                    onStatusChange={setStatus}
                    subjects={subjects}
                />
            </div>

            <div className="mt-6">
                {notes === undefined ? (
                    <NotesLoading />
                ) : (
                    <NotesList notes={filteredNotes} />
                )}
            </div>
        </motion.div>
    );
}