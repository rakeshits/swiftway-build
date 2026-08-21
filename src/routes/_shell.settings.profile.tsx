import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/shared/coming-soon";

export const Route = createFileRoute("/_shell/settings/profile")({
  head: () => ({
    meta: [
      { title: "Profile settings — Waypoint" },
      { name: "description", content: "Manage your Waypoint profile, theme preference and notification defaults." },
      { property: "og:title", content: "Profile settings — Waypoint" },
      { property: "og:description", content: "Manage your profile, theme and notification defaults." },
    ],
  }),
  component: () => (
    <ComingSoon title="Profile settings" description="Profile, theme and notification preferences." stage="Stage 10" />
  ),
});
