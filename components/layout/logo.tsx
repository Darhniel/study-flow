import { BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    linkTo?: string;
}

export function Logo({ className, linkTo = "/" }: LogoProps) {
    const content = (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">StudyFlow</span>
        </div>
    );

    if (linkTo) {
        return (
            <Link href={linkTo} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
                {content}
            </Link>
        );
    }
    return content;
}