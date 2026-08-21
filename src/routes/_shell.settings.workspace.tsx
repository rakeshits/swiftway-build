import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/shared/coming-soon";

export const Route = createFileRoute("/_shell/settings/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace settings — Waypoint" },
      { name: "description", content: "Workspace name, members, roles and shared labels for your Waypoint workspace." },
      { property: "og:title", content: "Workspace settings — Waypoint" },
      { property: "og:description", content: "Workspace name, members, roles and shared labels." },
    ],
  }),
  component: () => (
    <ComingSoon title="Workspace settings" description="Name, members, roles and shared labels." stage="Stage 10" />
  ),
});
