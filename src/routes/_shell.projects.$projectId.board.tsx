import { createFileRoute } from "@tanstack/react-router";
import { KanbanSquare } from "lucide-react";
import { StagePlaceholder } from "@/features/projects/components/stage-placeholder";

export const Route = createFileRoute("/_shell/projects/$projectId/board")({
  component: () => (
    <StagePlaceholder
      icon={KanbanSquare}
      title="Board is coming in the next stage"
      description="Drag-and-drop kanban columns with task cards and a deep-linkable slide-over panel land here next."
    />
  ),
});
