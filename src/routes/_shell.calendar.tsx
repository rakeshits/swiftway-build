import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/shared/coming-soon";

export const Route = createFileRoute("/_shell/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Waypoint" },
      { name: "description", content: "A global calendar of task due dates across every project in your workspace." },
      { property: "og:title", content: "Calendar — Waypoint" },
      { property: "og:description", content: "See every task due date across all projects." },
    ],
  }),
  component: () => (
    <ComingSoon title="Calendar" description="Month, week and day views of task due dates." stage="Stage 7" />
  ),
});
