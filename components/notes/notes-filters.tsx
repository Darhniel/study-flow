"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Subject {
    _id: string;
    name: string;
}

interface NotesFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    subjectId: string;
    onSubjectChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    subjects: Subject[];
    showSubjectFilter?: boolean;
}

export function NotesFilters({
    search,
    onSearchChange,
    subjectId,
    onSubjectChange,
    status,
    onStatusChange,
    subjects,
    showSubjectFilter = true,
}: NotesFiltersProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3 md:col-span-1">
                <Label htmlFor="search" className="sr-only">
                    Search
                </Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search"
                        type="search"
                        placeholder="Search notes…"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {showSubjectFilter && (
                <div>
                    <Label htmlFor="subject-filter">Subject</Label>
                    <select
                        id="subject-filter"
                        value={subjectId}
                        onChange={(e) => onSubjectChange(e.target.value)}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="">All subjects</option>
                        {subjects.map((s) => (
                            <option key={s._id} value={s._id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <Label htmlFor="status-filter">Status</Label>
                <select
                    id="status-filter"
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        </div>
    );
}