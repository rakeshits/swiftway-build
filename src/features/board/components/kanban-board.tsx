import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  boardColumns,
  createTask,
  getBoardTasks,
  updateTaskStatus,
  type BoardTask,
} from "@/features/board/api";
import type { TaskStatus } from "@/features/workspace/types";
import { BoardColumn, BoardColumnSkeleton } from "./board-column";
import { TaskCard } from "./task-card";

export function KanbanBoard({
  projectId,
  onOpenTask,
}: {
  projectId: string;
  onOpenTask: (taskId: string) => void;
}) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => getBoardTasks(projectId),
  });

  const [items, setItems] = useState<BoardTask[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (query.data && !activeId) setItems(query.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const move = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["board", projectId] });
      void qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Could not save the move");
      void qc.invalidateQueries({ queryKey: ["board", projectId] });
    },
  });

  const add = useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      setItems((prev) => [...prev, task]);
      void qc.invalidateQueries({ queryKey: ["board", projectId] });
      void qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success(`Added “${task.title}”`);
    },
  });

  const byStatus = useMemo(() => {
    const map = new Map<TaskStatus, BoardTask[]>(boardColumns.map((c) => [c.status, []]));
    for (const task of items) map.get(task.status)?.push(task);
    return map;
  }, [items]);

  const activeTask = items.find((t) => t.id === activeId) ?? null;

  const statusOf = (id: string): TaskStatus | null => {
    if (boardColumns.some((c) => c.status === id)) return id as TaskStatus;
    return items.find((t) => t.id === id)?.status ?? null;
  };

  const onDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

    const overStatus = statusOf(overIdStr);
    const activeStatus = statusOf(activeIdStr);
    if (!overStatus || !activeStatus || overStatus === activeStatus) return;

    setItems((prev) => {
      const from = prev.findIndex((t) => t.id === activeIdStr);
      if (from < 0) return prev;
      const next = prev.map((t) => (t.id === activeIdStr ? { ...t, status: overStatus } : t));
      const overIndex = next.findIndex((t) => t.id === overIdStr);
      return arrayMove(next, from, overIndex >= 0 ? overIndex : next.length - 1);
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    const status = statusOf(activeIdStr);
    if (!status) return;

    let next = items;
    if (activeIdStr !== overIdStr && !boardColumns.some((c) => c.status === overIdStr)) {
      const from = items.findIndex((t) => t.id === activeIdStr);
      const to = items.findIndex((t) => t.id === overIdStr);
      if (from >= 0 && to >= 0) {
        next = arrayMove(items, from, to);
        setItems(next);
      }
    }

    move.mutate({
      taskId: activeIdStr,
      status,
      orderedIds: next.filter((t) => t.status === status).map((t) => t.id),
    });
  };

  if (query.isLoading) {
    return (
      <BoardScroller>
        {boardColumns.map((c, i) => (
          <BoardColumnSkeleton key={c.status} label={c.label} count={i === 4 ? 1 : 2} />
        ))}
      </BoardScroller>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <BoardScroller>
        {boardColumns.map((column) => (
          <BoardColumn
            key={column.status}
            status={column.status}
            label={column.label}
            tasks={byStatus.get(column.status) ?? []}
            onOpenTask={onOpenTask}
            onAddTask={(status, title) => add.mutate({ projectId, status, title })}
          />
        ))}
      </BoardScroller>

      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
        {activeTask ? (
          <motion.div
            initial={{ scale: 1, rotate: 0 }}
            animate={{ scale: 1.03, rotate: -1.2 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            <TaskCard task={activeTask} overlay />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function BoardScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-color:var(--border-strong)_transparent] [scrollbar-width:thin]">
      <div className="flex items-start gap-3">{children}</div>
      <p className="mt-2 text-[11px] text-muted-foreground lg:hidden">Scroll sideways for more columns →</p>
    </div>
  );
}
