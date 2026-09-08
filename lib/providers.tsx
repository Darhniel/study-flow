"use client";

import { ConvexProvider, ConvexReactClient, ConvexProviderWithAuth } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import type { ReactNode } from "react";


const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexReactClient(convexUrl);

interface ProvidersProps {
    children: ReactNode;
}


export function Providers({ children }: ProvidersProps) {

    return (
        <ConvexAuthNextjsProvider client={convex}>
            <>
                {children}
            </>
        </ConvexAuthNextjsProvider>
    );
}