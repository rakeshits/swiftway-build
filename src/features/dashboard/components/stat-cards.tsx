import { AlertTriangle, CheckCircle2, FolderKanban, ListChecks, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/features/workspace/types";
import { cn } from "@/lib/utils";

type Card = {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
  tone: string;
  hint: string;
};

const cards: Card[] = [
  { key: "activeProjects", label: "Active projects", icon: FolderKanban, tone: "text-primary", hint: "in this workspace" },
  { key: "totalTasks", label: "Total tasks", icon: ListChecks, tone: "text-info", hint: "across all projects" },
  { key: "completedTasks", label: "Completed", icon: CheckCircle2, tone: "text-success", hint: "marked done" },
  { key: "overdueTasks", label: "Overdue", icon: AlertTriangle, tone: "text-destructive", hint: "past due date" },
];

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.key} className="panel p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-8 w-14" />
          <Skeleton className="mt-3 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.04, ease: "easeOut" }}
          className="panel p-4 transition-colors hover:border-border-strong"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
            <c.icon className={cn("size-4", c.tone)} />
          </div>
          <div className="mt-3 text-numeric text-3xl font-semibold tracking-tight">{stats[c.key]}</div>
          <p className="mt-1.5 text-xs text-muted-foreground">{c.hint}</p>
        </motion.div>
      ))}
    </div>
  );
}
