import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";
import { StagePlaceholder } from "@/features/projects/components/stage-placeholder";

export const Route = createFileRoute("/_shell/projects/$projectId/calendar")({
  component: () => (
    <StagePlaceholder
      icon={CalendarRange}
      title="Calendar is coming in a later stage"
      description="A month grid of task due dates with drag-to-reschedule is planned for this tab."
    />
  ),
});
