import { forwardRef } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { CheckSquare, MessageSquare } from "lucide-react";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { priorityDot, priorityTone } from "@/features/projects/components/project-meta";
import { Skeleton } from "@/components/ui/skeleton";
import type { BoardTask } from "@/features/board/api";
import type { Label } from "@/features/workspace/types";
import { cn } from "@/lib/utils";

const labelTone: Record<Label["tone"], string> = {
  primary: "border-primary/30 bg-primary/12 text-primary",
  info: "border-info/30 bg-info/12 text-info",
  warning: "border-warning/30 bg-warning/12 text-warning",
  success: "border-success/30 bg-success/12 text-success",
  destructive: "border-destructive/30 bg-destructive/12 text-destructive",
};

function DueDate({ date, done }: { date: string; done: boolean }) {
  const days = differenceInCalendarDays(parseISO(date), new Date());
  const overdue = !done && days < 0;
  const soon = !done && days >= 0 && days <= 2;
  return (
    <span
      className={cn(
        "text-numeric text-[11px] font-medium",
        overdue ? "text-destructive" : soon ? "text-warning" : "text-muted-foreground",
      )}
    >
      {overdue ? "Overdue " : ""}
      {format(parseISO(date), "MMM d")}
    </span>
  );
}

export type TaskCardProps = {
  task: BoardTask;
  onOpen?: (taskId: string) => void;
  dragging?: boolean;
  overlay?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(function TaskCard(
  { task, onOpen, dragging, overlay, className, style, ...rest },
  ref,
) {
  const shownLabels = task.labels.slice(0, 3);
  const restLabels = task.labels.length - shownLabels.length;

  return (
    <div
      ref={ref}
      style={style}
      {...rest}
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(task.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(task.id);
        }
      }}
      className={cn(
        "cursor-grab rounded-lg border border-border bg-card p-3 text-left transition-colors select-none",
        "hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        dragging && "opacity-40",
        overlay && "cursor-grabbing border-border-strong shadow-2xl",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm leading-snug font-medium">{task.title}</p>
        {task.assignee ? (
          <MemberAvatar member={task.assignee} size="sm" />
        ) : (
          <span className="size-6 shrink-0 rounded-full border border-dashed border-border" />
        )}
      </div>

      {shownLabels.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1">
          {shownLabels.map((l) => (
            <span
              key={l.id}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] font-medium",
                labelTone[l.tone],
              )}
            >
              {l.name}
            </span>
          ))}
          {restLabels > 0 && (
            <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{restLabels}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium capitalize">
          <span className={cn("size-1.5 rounded-full", priorityDot[task.priority])} />
          <span className={priorityTone[task.priority]}>{task.priority}</span>
        </span>
        <div className="flex items-center gap-2.5">
          {task.checklistTotal > 0 && (
            <span className="text-numeric inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <CheckSquare className="size-3.5" />
              {task.checklistDone}/{task.checklistTotal}
            </span>
          )}
          {task.commentCount > 0 && (
            <span className="text-numeric inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <MessageSquare className="size-3.5" />
              {task.commentCount}
            </span>
          )}
          {task.dueDate && <DueDate date={task.dueDate} done={task.status === "done"} />}
        </div>
      </div>
    </div>
  );
});

export function TaskCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="size-6 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-4 w-16 rounded" />
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}
