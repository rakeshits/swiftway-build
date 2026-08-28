import { createFileRoute } from "@tanstack/react-router";
import { Rows3 } from "lucide-react";
import { StagePlaceholder } from "@/features/projects/components/stage-placeholder";

export const Route = createFileRoute("/_shell/projects/$projectId/list")({
  component: () => (
    <StagePlaceholder
      icon={Rows3}
      title="List view is coming in the next stage"
      description="A dense, sortable and filterable task table with inline editing arrives right after the board."
    />
  ),
});
