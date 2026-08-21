import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/shared/coming-soon";

export const Route = createFileRoute("/_shell/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Waypoint" },
      { name: "description", content: "Completion rate, overdue trends and work distribution charts for your workspace." },
      { property: "og:title", content: "Analytics — Waypoint" },
      { property: "og:description", content: "Completion rate, overdue trends and work distribution." },
    ],
  }),
  component: () => (
    <ComingSoon title="Analytics" description="Completion rate, trends and work distribution." stage="Stage 9" />
  ),
});
