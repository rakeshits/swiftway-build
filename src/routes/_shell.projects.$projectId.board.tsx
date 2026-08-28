import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KanbanBoard } from "@/features/board/components/kanban-board";
import { TaskPanel } from "@/features/board/components/task-panel";

export const Route = createFileRoute("/_shell/projects/$projectId/board")({
  validateSearch: (search: Record<string, unknown>) => ({
    task: typeof search.task === "string" && search.task ? search.task : undefined,
  }),
  component: BoardView,
});

function BoardView() {
  const { projectId } = Route.useParams();
  const { task } = Route.useSearch();
  const navigate = useNavigate();

  const openTask = (taskId: string) =>
    void navigate({
      to: "/projects/$projectId/board",
      params: { projectId },
      search: { task: taskId },
    });

  const closeTask = () =>
    void navigate({
      to: "/projects/$projectId/board",
      params: { projectId },
      search: { task: undefined },
    });

  return (
    <>
      <KanbanBoard projectId={projectId} onOpenTask={openTask} />
      <TaskPanel taskId={task} onClose={closeTask} />
    </>
  );
}
