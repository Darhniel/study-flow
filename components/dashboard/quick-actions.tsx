"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, BookMarked, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { staggerItem } from "@/lib/animations";

export function QuickActions() {
    const actions = [
        {
            label: "Create Note",
            href: "/notes/new",
            icon: Plus,
            primary: true,
        },
        {
            label: "Browse Notes",
            href: "/notes",
            icon: BookMarked,
            primary: false,
        },
        {
            label: "Browse Subjects",
            href: "/subjects",
            icon: FolderOpen,
            primary: false,
        },
    ];

    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">Quick actions</h3>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap gap-2"
                >
                    {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <motion.div key={action.href} variants={staggerItem}>
                                <Button variant={action.primary ? "default" : "outline"}>
                                    <Link href={action.href} className="flex items-center gap-1">
                                        <Icon className="h-4 w-4" />
                                        {action.label}
                                    </Link>
                                </Button>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </CardContent>
        </Card>
    );
}