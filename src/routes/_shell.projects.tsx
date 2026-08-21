import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/shared/coming-soon";

export const Route = createFileRoute("/_shell/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Waypoint" },
      { name: "description", content: "Browse every project in your Waypoint workspace with progress, owners and due dates." },
      { property: "og:title", content: "Projects — Waypoint" },
      { property: "og:description", content: "Browse every project in your Waypoint workspace." },
    ],
  }),
  component: () => (
    <ComingSoon title="Projects" description="Project cards, creation dialogs and archiving." stage="Stage 3" />
  ),
});
