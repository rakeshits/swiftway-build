import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/shared/coming-soon";

export const Route = createFileRoute("/_shell/team")({
  head: () => ({
    meta: [
      { title: "Team — Waypoint" },
      { name: "description", content: "Workspace members, roles and per-person workload in Waypoint." },
      { property: "og:title", content: "Team — Waypoint" },
      { property: "og:description", content: "Workspace members, roles and workload." },
    ],
  }),
  component: () => (
    <ComingSoon title="Team" description="Member cards, roles and workload indicators." stage="Stage 8" />
  ),
});
