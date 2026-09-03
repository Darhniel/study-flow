import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staggerItem } from "@/lib/animations";
import { formatDate } from "@/lib/utils";

export interface RecentNote {
    id: string;
    title: string;
    subjectName?: string;
    status: "draft" | "completed";
    createdAt: number;
}

interface RecentNotesListProps {
    notes: RecentNote[];
    emptyMessage?: string;
}

export function RecentNotesList({ notes, emptyMessage }: RecentNotesListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recently created</CardTitle>
            </CardHeader>
            <CardContent>
                {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {emptyMessage ?? "No notes yet. Create your first note to get started."}
                    </p>
                ) : (
                    <motion.ul
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        initial="hidden"
                        animate="visible"
                        className="divide-y"
                    >
                        {notes.map((note) => (
                            <motion.li key={note.id} variants={staggerItem}>
                                <Link
                                    href={`/notes/${note.id}`}
                                    className="flex items-center justify-between py-3 hover:text-primary transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{note.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {note.subjectName ?? "Unassigned"} · {formatDate(note.createdAt)}
                                        </p>
                                    </div>
                                    <Badge variant={note.status === "completed" ? "default" : "secondary"}>
                                        {note.status}
                                    </Badge>
                                </Link>
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </CardContent>
        </Card>
    );
}