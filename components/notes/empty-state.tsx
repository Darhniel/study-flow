import { FileText, FolderOpen, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionHref?: string;
    actionLabel?: string;
    type?: "notes" | "subjects" | "search";
}

export function EmptyState({
    title = "No notes yet",
    description = "Create your first note to get started.",
    actionHref = "/notes/new",
    actionLabel = "Create note",
    type = "notes",
}: EmptyStateProps) {
    const Icon = type === "subjects" ? FolderOpen : type === "search" ? Search : FileText;

    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
            {actionHref && (
                <Button asChild className="mt-6">
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            )}
        </div>
    );
}