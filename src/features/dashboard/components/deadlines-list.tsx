import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { CalendarClock, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { MemberAvatar } from "@/components/shared/member-avatar";
import type { UpcomingDeadline } from "@/features/workspace/api";
import type { Priority } from "@/features/workspace/types";
import { cn } from "@/lib/utils";

const priorityTone: Record<Priority, string> = {
  urgent: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-warning/15 text-warning border-warning/30",
  medium: "bg-info/15 text-info border-info/30",
  low: "bg-muted text-muted-foreground border-border",
};

function dueLabel(date: string) {
  const days = differenceInCalendarDays(parseISO(date), new Date());
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, tone: "text-destructive" };
  if (days === 0) return { text: "Due today", tone: "text-warning" };
  if (days === 1) return { text: "Due tomorrow", tone: "text-warning" };
  return { text: format(parseISO(date), "MMM d"), tone: "text-muted-foreground" };
}

export function DeadlinesSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="size-6 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DeadlinesList({ items }: { items: UpcomingDeadline[] }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No upcoming deadlines"
        description="Tasks with a due date show up here so nothing slips through the cracks."
        action={
          <Button size="sm" variant="outline">
            <Plus className="size-4" /> Add a task
          </Button>
        }
        className="border-0 bg-transparent py-8"
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((task) => {
        const due = dueLabel(task.dueDate!);
        return (
          <li
            key={task.id}
            className="flex items-center gap-3 py-3 transition-colors first:pt-0 hover:bg-accent/30"
          >
            {task.assignee ? (
              <MemberAvatar member={task.assignee} size="sm" />
            ) : (
              <span className="inline-flex size-6 items-center justify-center rounded-full border border-dashed border-border-strong text-[10px] text-muted-foreground">
                ?
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{task.title}</p>
              <p className="truncate text-xs text-muted-foreground">{task.projectName}</p>
            </div>
            <Badge variant="outline" className={cn("hidden capitalize sm:inline-flex", priorityTone[task.priority])}>
              {task.priority}
            </Badge>
            <span className={cn("text-numeric shrink-0 text-xs font-medium", due.tone)}>{due.text}</span>
          </li>
        );
      })}
    </ul>
  );
}
