"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/layout/logo";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
            <div className="mb-8">
                <Logo />
            </div>
            <AuthForm mode="signIn" />
        </div>
    );
}