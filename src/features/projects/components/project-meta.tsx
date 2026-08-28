import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Priority, ProjectStatus } from "@/features/workspace/types";

export const statusMeta: Record<ProjectStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/15 text-success border-success/30" },
  on_hold: { label: "On Hold", className: "bg-warning/15 text-warning border-warning/30" },
  completed: { label: "Completed", className: "bg-info/15 text-info border-info/30" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground border-border" },
};

export const priorityTone: Record<Priority, string> = {
  urgent: "text-destructive",
  high: "text-warning",
  medium: "text-info",
  low: "text-muted-foreground",
};

export const priorityDot: Record<Priority, string> = {
  urgent: "bg-destructive",
  high: "bg-warning",
  medium: "bg-info",
  low: "bg-muted-foreground",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = statusMeta[status];
  return (
    <Badge variant="outline" className={cn("font-medium", meta.className)}>
      {meta.label}
    </Badge>
  );
}

export function PriorityIndicator({ priority }: { priority: Priority }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium capitalize">
      <span className={cn("size-1.5 rounded-full", priorityDot[priority])} />
      <span className={priorityTone[priority]}>{priority}</span>
    </span>
  );
}
