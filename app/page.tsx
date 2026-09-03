"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookMarked, CheckCircle2, Circle, FolderOpen } from "lucide-react";
import { StatsCard } from "@/components/notes/stats-card";
import { RecentNotes } from "@/components/dashboard/recent-notes";
import { RecentAIMaterial } from "@/components/dashboard/recent-ai-material";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card, CardContent } from "@/components/ui/card";
import { fadeIn, staggerContainer } from "@/lib/animations";

export default function DashboardPage() {
  const totalNotes = useQuery(api.notes.count) ?? 0;
  const activeNotes = useQuery(api.notes.countByStatus, { status: "active" }) ?? 0;
  const completedNotes = useQuery(api.notes.countByStatus, { status: "completed" }) ?? 0;
  const subjectsCount = useQuery(api.subjects.count) ?? 0;
  const recentNotes = useQuery(api.notes.listRecentlyUpdated, { limit: 5 }) ?? [];
  const notesWithMaterial = useQuery(api.notes.listWithStudyMaterial, { limit: 3 }) ?? [];

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s an overview of your study progress.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        <StatsCard label="Total notes" value={totalNotes} icon={BookMarked} />
        <StatsCard label="Active" value={activeNotes} icon={Circle} />
        <StatsCard label="Completed" value={completedNotes} icon={CheckCircle2} />
        <StatsCard label="Subjects" value={subjectsCount} icon={FolderOpen} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Card>
            <CardContent className="p-6">
              <ProgressBar completed={completedNotes} total={totalNotes} />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <QuickActions />
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <RecentNotes
            notes={recentNotes.map((n) => ({
              _id: n._id,
              title: n.title,
              status: n.status,
              updatedAt: n.updatedAt,
            }))}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <RecentAIMaterial
            notes={notesWithMaterial.map((n) => ({
              _id: n._id,
              title: n.title,
              status: n.status,
              materialCreatedAt: n.materialCreatedAt,
            }))}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}