import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { staggerItem } from "@/lib/animations";

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
}

export function StatsCard({ label, value, icon: Icon, description }: StatsCardProps) {
    return (
        <motion.div variants={staggerItem}>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{label}</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
                            {description && (
                                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                            )}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}