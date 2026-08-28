import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { PriorityIndicator } from "@/features/projects/components/project-meta";
import { getTask, boardColumns } from "@/features/board/api";

export function TaskPanel({ taskId, onClose }: { taskId: string | undefined; onClose: () => void }) {
  useEffect(() => {
    if (!taskId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [taskId, onClose]);

  return (
    <AnimatePresence>
      {taskId ? (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-background/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Task details"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl"
            initial={{ x: "100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.4 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <PanelBody taskId={taskId} onClose={onClose} />
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function PanelBody({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const task = useQuery({ queryKey: ["task", taskId], queryFn: () => getTask(taskId) });

  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <span className="text-numeric text-xs text-muted-foreground">{taskId.toUpperCase()}</span>
        <Button variant="ghost" size="icon" className="size-8" onClick={onClose} aria-label="Close task panel">
          <X className="size-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        {task.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        ) : !task.data ? (
          <p className="text-sm text-muted-foreground">This task no longer exists.</p>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold tracking-tight">{task.data.title}</h2>

            <dl className="space-y-3 rounded-lg border border-border bg-card p-4 text-sm">
              <Row label="Status">
                <span className="capitalize">
                  {boardColumns.find((c) => c.status === task.data!.status)?.label}
                </span>
              </Row>
              <Row label="Priority">
                <PriorityIndicator priority={task.data.priority} />
              </Row>
              <Row label="Assignee">
                {task.data.assignee ? (
                  <span className="inline-flex items-center gap-2">
                    <MemberAvatar member={task.data.assignee} size="xs" />
                    {task.data.assignee.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </Row>
              <Row label="Due date">
                {task.data.dueDate ? (
                  <span className="text-numeric">
                    {format(parseISO(task.data.dueDate), "MMM d, yyyy")}
                  </span>
                ) : (
                  <span className="text-muted-foreground">No due date</span>
                )}
              </Row>
            </dl>

            <p className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
              Checklist, comments, subtasks and activity history arrive in the next stage.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}
