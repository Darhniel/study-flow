import { FolderOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionHref?: string;
    actionLabel?: string;
    setCreateOpen: () => void
    
}

export function EmptyState({
    title = "No subjects yet",
    description = "Create your first subject to start organizing your notes.",
    actionHref = "/subjects/new",
    actionLabel = "Create subject",
    setCreateOpen,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <FolderOpen 
                    className="h-6 w-6 text-muted-foreground" 
                />
            </div>
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
                <Button 
                    className="mt-6" 
                    onClick={() => setCreateOpen()}
                >
                    {actionLabel}
                </Button>
        </div>
    );
}