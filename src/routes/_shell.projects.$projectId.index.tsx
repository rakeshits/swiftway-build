import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/projects/$projectId/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/projects/$projectId/board",
      params: { projectId: params.projectId },
    });
  },
});
