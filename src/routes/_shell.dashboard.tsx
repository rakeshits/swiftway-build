import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FolderPlus, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  getDashboardStats,
  getProjects,
  getRecentActivity,
  getThroughput,
  getUpcomingDeadlines,
} from "@/features/workspace/api";
import { StatCards, StatCardsSkeleton } from "@/features/dashboard/components/stat-cards";
import { DeadlinesList, DeadlinesSkeleton } from "@/features/dashboard/components/deadlines-list";
import { ActivityFeed, ActivityFeedSkeleton } from "@/features/dashboard/components/activity-feed";
import {
  ThroughputChart,
  ThroughputChartSkeleton,
} from "@/features/dashboard/components/throughput-chart";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Waypoint" },
      {
        name: "description",
        content:
          "Workspace overview: active projects, task throughput, upcoming deadlines and team activity in Waypoint.",
      },
      { property: "og:title", content: "Dashboard — Waypoint" },
      {
        property: "og:description",
        content: "Keyboard-first project management for small engineering teams.",
      },
    ],
  }),
  component: DashboardPage,
});

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="panel flex flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function DashboardPage() {
  const projects = useQuery({ queryKey: ["projects"], queryFn: getProjects });
  const stats = useQuery({ queryKey: ["dashboard-stats"], queryFn: getDashboardStats });
  const deadlines = useQuery({ queryKey: ["deadlines"], queryFn: () => getUpcomingDeadlines(6) });
  const activity = useQuery({ queryKey: ["activity"], queryFn: getRecentActivity });
  const throughput = useQuery({ queryKey: ["throughput"], queryFn: () => getThroughput(14) });

  const hasProjects = (projects.data?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Everything moving across Northwind Labs this week."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/projects">View projects</Link>
            </Button>
            <Button size="sm">
              <Plus className="size-4" /> New task
            </Button>
          </>
        }
      />

      {!projects.isLoading && !hasProjects ? (
        <EmptyState
          icon={FolderPlus}
          title="No projects yet"
          description="Create your first project to start tracking work, deadlines and team progress."
          action={
            <Button size="sm">
              <Plus className="size-4" /> Create project
            </Button>
          }
        />
      ) : (
        <>
          {stats.isLoading || !stats.data ? <StatCardsSkeleton /> : <StatCards stats={stats.data} />}

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionCard
                title="Throughput"
                description="Tasks created vs. completed over the last 14 days."
              >
                {throughput.isLoading || !throughput.data ? (
                  <ThroughputChartSkeleton />
                ) : (
                  <ThroughputChart data={throughput.data} />
                )}
              </SectionCard>
            </div>

            <SectionCard title="Recent activity" description="Latest updates from your team.">
              {activity.isLoading || !activity.data ? (
                <ActivityFeedSkeleton />
              ) : (
                <ActivityFeed items={activity.data} />
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Upcoming deadlines"
            description="Sorted by due date across every project."
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link to="/calendar">Open calendar</Link>
              </Button>
            }
          >
            {deadlines.isLoading || !deadlines.data ? (
              <DeadlinesSkeleton />
            ) : (
              <DeadlinesList items={deadlines.data} />
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
