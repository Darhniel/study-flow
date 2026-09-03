"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    if (!convex) {
        return <>{children}</>;
    }
    return (
        <ConvexProvider client={convex}>
            <ConvexAuthNextjsProvider>{children}</ConvexAuthNextjsProvider>
        </ConvexProvider>
    );
}