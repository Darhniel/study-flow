"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotesFilters } from "@/components/notes/notes-filters";
import { NotesList } from "@/components/notes/notes-list";
import { NotesLoading } from "@/components/notes/notes-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { fadeIn } from "@/lib/animations";

interface SubjectPageProps {
    params: { id: string };
}

export default function SubjectPage({ params }: SubjectPageProps) {
    const subjectId = params.id as Id<"subjects">;
    const subject = useQuery(api.subjects.get, { id: subjectId });
    const notes = useQuery(api.notes.list, { subjectId });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const debouncedSearch = useDebounce(search, 300);

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

        const filtered = status ? base.filter((n) => n.status === status) : base;

        return filtered.map((n) => ({
            _id: n._id,
            title: n.title,
            content: n.content,
            subjectId: n.subjectId,
            subjectName: subject?.name,
            status: n.status,
            updatedAt: n.updatedAt,
        }));
    }, [notes, debouncedSearch, status, subject]);

    if (subject === undefined) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <NotesLoading />
            </div>
        );
    }

    if (subject === null) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-lg border p-10 text-center">
                    <p className="text-sm text-muted-foreground">Subject not found.</p>
                    <Button asChild className="mt-4" variant="outline">
                        <Link href="/subjects">Back to subjects</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
        >
            <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
                <Link href="/subjects">
                    <ArrowLeft className="h-4 w-4" />
                    Back to subjects
                </Link>
            </Button>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{subject.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        {notes ? `${notes.length} notes` : "Loading…"}
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
                    onSubjectChange={() => { }}
                    status={status}
                    onStatusChange={setStatus}
                    subjects={[]}
                    showSubjectFilter={false}
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