import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BoardTask } from "@/features/board/api";
import type { TaskStatus } from "@/features/workspace/types";
import { cn } from "@/lib/utils";
import { SortableTaskCard } from "./sortable-task-card";
import { TaskCardSkeleton } from "./task-card";

const accent: Record<TaskStatus, string> = {
  backlog: "bg-muted-foreground",
  todo: "bg-info",
  in_progress: "bg-primary",
  in_review: "bg-warning",
  done: "bg-success",
};

export function BoardColumn({
  status,
  label,
  tasks,
  onOpenTask,
  onAddTask,
}: {
  status: TaskStatus;
  label: string;
  tasks: BoardTask[];
  onOpenTask: (taskId: string) => void;
  onAddTask: (status: TaskStatus, title: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: "column", status } });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const submit = () => {
    const next = title.trim();
    if (!next) return setAdding(false);
    onAddTask(status, next);
    setTitle("");
  };

  return (
    <section
      className={cn(
        "flex w-[280px] shrink-0 flex-col rounded-lg border border-border bg-surface transition-colors sm:w-[300px] xl:w-auto xl:min-w-0",
        isOver && "border-primary/40 bg-primary/[0.04]",
      )}
    >
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <span className={cn("size-1.5 rounded-full", accent[status])} />
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-numeric ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className="flex max-h-[min(60vh,540px)] min-h-24 flex-1 flex-col gap-2 overflow-y-auto p-2"
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 520, damping: 38 }}
              >
                <SortableTaskCard task={task} onOpen={onOpenTask} />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && (
          <div
            className={cn(
              "rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground",
              isOver && "border-primary/50 text-primary",
            )}
          >
            Drop tasks here
          </div>
        )}
      </div>

      <div className="border-t border-border p-2">
        {adding ? (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              value={title}
              placeholder="Task title"
              onChange={(e) => setTitle(e.target.value)}
              onBlur={submit}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") {
                  setTitle("");
                  setAdding(false);
                }
              }}
              className="h-8 text-sm"
              aria-label={`New task in ${label}`}
            />
            <Button
              size="icon"
              variant="ghost"
              className="size-8 shrink-0"
              onClick={() => {
                setTitle("");
                setAdding(false);
              }}
              aria-label="Cancel new task"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setAdding(true)}
          >
            <Plus className="size-4" /> Add task
          </Button>
        )}
      </div>
    </section>
  );
}

export function BoardColumnSkeleton({ label, count }: { label: string; count: number }) {
  return (
    <section className="flex w-[280px] shrink-0 flex-col rounded-lg border border-border bg-surface sm:w-[300px] xl:w-auto xl:min-w-0">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <span className="size-1.5 rounded-full bg-muted" />
        <h3 className="text-sm font-semibold text-muted-foreground">{label}</h3>
      </header>
      <div className="flex flex-col gap-2 p-2">
        {Array.from({ length: count }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
