import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import { activity, labels, members, projects, tasks } from "./mock-data";
import type {
  ActivityEntry,
  DashboardStats,
  Label,
  Member,
  Project,
  Task,
  ThroughputPoint,
} from "./types";

/** Simulated network latency so loading states are real and testable. */
const latency = () => 150 + Math.round(Math.random() * 250);

function delayed<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), latency()));
}

export const getMembers = (): Promise<Member[]> => delayed(members);
export const getLabels = (): Promise<Label[]> => delayed(labels);
export const getProjects = (): Promise<Project[]> =>
  delayed(projects.filter((p) => p.status !== "archived"));
export const getTasks = (): Promise<Task[]> => delayed(tasks);

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const completed = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter(
    (t) => t.status !== "done" && t.dueDate && differenceInCalendarDays(parseISO(t.dueDate), now) < 0,
  ).length;
  return delayed({
    activeProjects: projects.filter((p) => p.status !== "completed" && p.status !== "archived").length,
    totalTasks: tasks.length,
    completedTasks: completed,
    overdueTasks: overdue,
  });
}

export type UpcomingDeadline = Task & { projectName: string; assignee: Member | null };

export async function getUpcomingDeadlines(limit = 6): Promise<UpcomingDeadline[]> {
  const enriched = tasks
    .filter((t) => t.status !== "done" && t.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, limit)
    .map((t) => ({
      ...t,
      projectName: projects.find((p) => p.id === t.projectId)?.name ?? "Unknown",
      assignee: members.find((m) => m.id === t.assigneeId) ?? null,
    }));
  return delayed(enriched);
}

export type ActivityItem = ActivityEntry & { member: Member; projectName: string };

export async function getRecentActivity(): Promise<ActivityItem[]> {
  return delayed(
    activity.map((a) => ({
      ...a,
      member: members.find((m) => m.id === a.memberId)!,
      projectName: projects.find((p) => p.id === a.projectId)?.name ?? "Unknown",
    })),
  );
}

export async function getThroughput(days = 14): Promise<ThroughputPoint[]> {
  const points: ThroughputPoint[] = Array.from({ length: days }, (_, i) => {
    const d = subDays(new Date(), days - 1 - i);
    const seed = (d.getDate() * 7 + d.getMonth() * 3) % 9;
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    return {
      date: format(d, "MMM d"),
      completed: weekend ? Math.max(0, seed - 6) : 2 + seed,
      created: weekend ? Math.max(0, seed - 5) : 3 + ((seed + 4) % 7),
    };
  });
  return delayed(points);
}

/** Project progress = share of its tasks that are done. */
export function projectProgress(projectId: string): number {
  const list = tasks.filter((t) => t.projectId === projectId);
  if (!list.length) return 0;
  return Math.round((list.filter((t) => t.status === "done").length / list.length) * 100);
}
