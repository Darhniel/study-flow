"use client";

import { useConvexAuth } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthGateProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function AuthGate({ children, redirectTo = "/login" }: AuthGateProps) {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(redirectTo)
        }
    }, [isLoading, isAuthenticated, router, pathname]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="space-y-4 w-full max-w-md px-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    // if (!isAuthenticated) {
    //     return null;
    // }

    return <>{children}</>;
}