import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CalendarDays, Check, FolderX, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { AvatarStack } from "@/components/shared/member-avatar";
import { getProject, getProjectActivity, updateProject } from "@/features/projects/api";
import {
  PriorityIndicator,
  StatusBadge,
} from "@/features/projects/components/project-meta";
import {
  ProjectActivity,
  ProjectActivitySkeleton,
} from "@/features/projects/components/project-activity";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project — Waypoint" },
      {
        name: "description",
        content: "Project overview with progress, team, priority, deadlines and recent activity.",
      },
      { property: "og:title", content: "Project — Waypoint" },
      {
        property: "og:description",
        content: "Board, list, calendar and settings for a single Waypoint project.",
      },
    ],
  }),
  component: ProjectDetailShell,
});

const tabs = [
  { label: "Board", to: "/projects/$projectId/board" },
  { label: "List", to: "/projects/$projectId/list" },
  { label: "Calendar", to: "/projects/$projectId/calendar" },
  { label: "Settings", to: "/projects/$projectId/settings" },
] as const;

function ProjectDetailShell() {
  const { projectId } = Route.useParams();
  const qc = useQueryClient();
  const matchRoute = useMatchRoute();

  const project = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProject(projectId),
  });
  const activity = useQuery({
    queryKey: ["projects", projectId, "activity"],
    queryFn: () => getProjectActivity(projectId),
  });

  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const rename = useMutation({
    mutationFn: (name: string) => updateProject(projectId, { name }),
    onSuccess: (p) => {
      void qc.invalidateQueries({ queryKey: ["projects"] });
      setEditingName(false);
      toast.success(`Renamed to ${p.name}`);
    },
  });

  useEffect(() => {
    if (editingName) inputRef.current?.focus();
  }, [editingName]);

  if (project.isLoading) {
    return (
      <div className="space-y-6">
        <div className="panel space-y-4 p-5">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <Skeleton className="h-9 w-72 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!project.data) {
    return (
      <EmptyState
        icon={FolderX}
        title="Project not found"
        description="This project may have been deleted or you followed an out-of-date link."
        action={
          <Button size="sm" asChild>
            <Link to="/projects">Back to projects</Link>
          </Button>
        }
      />
    );
  }

  const p = project.data;

  const startRename = () => {
    setDraftName(p.name);
    setEditingName(true);
  };

  const commitRename = () => {
    const next = draftName.trim();
    if (!next || next === p.name) return setEditingName(false);
    rename.mutate(next);
  };

  return (
    <div className="space-y-6">
      <div className="panel p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-numeric rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {p.key}
              </span>
              <StatusBadge status={p.status} />
              <PriorityIndicator priority={p.priority} />
              <span className="text-numeric inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Due {format(parseISO(p.dueDate), "MMM d, yyyy")}
              </span>
            </div>

            {editingName ? (
              <div className="mt-2 flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="h-9 max-w-sm text-lg font-semibold"
                  aria-label="Project name"
                />
                <Button size="icon" className="size-8" onClick={commitRename} aria-label="Save name">
                  <Check className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() => setEditingName(false)}
                  aria-label="Cancel rename"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startRename}
                className="group mt-2 flex items-center gap-2 text-left"
              >
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{p.name}</h1>
                <Pencil className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            )}

            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{p.description}</p>
          </div>

          <div className="w-full shrink-0 space-y-3 lg:w-64">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {p.doneCount}/{p.taskCount} tasks done
                </span>
                <span className="text-numeric font-medium">{p.progress}%</span>
              </div>
              <Progress value={p.progress} className="h-1.5" />
            </div>
            <div className="flex items-center justify-between">
              <AvatarStack members={p.members} max={4} size="md" />
              <span className="text-xs text-muted-foreground">{p.members.length} members</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <nav className="flex w-full gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
            {tabs.map((tab) => {
              const active = Boolean(matchRoute({ to: tab.to, params: { projectId }, fuzzy: false }));
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  params={{ projectId }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-elevated text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <Outlet />
        </div>

        <section className="panel flex flex-col p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Latest updates in this project.</p>
          </div>
          <div className="flex-1">
            {activity.isLoading || !activity.data ? (
              <ProjectActivitySkeleton />
            ) : (
              <ProjectActivity items={activity.data} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
