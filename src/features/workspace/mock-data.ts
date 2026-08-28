import { addDays, format, subDays } from "date-fns";
import type { ActivityEntry, Label, Member, Project, Task } from "./types";

const today = new Date();
const iso = (d: Date) => format(d, "yyyy-MM-dd");

export const members: Member[] = [
  { id: "m1", name: "Priya Raman", role: "Engineering Lead", email: "priya@waypoint.dev", color: "var(--chart-1)" },
  { id: "m2", name: "Daniel Okafor", role: "Frontend Engineer", email: "daniel@waypoint.dev", color: "var(--chart-2)" },
  { id: "m3", name: "Mira Holt", role: "Product Designer", email: "mira@waypoint.dev", color: "var(--chart-5)" },
  { id: "m4", name: "Sam Iversen", role: "Backend Engineer", email: "sam@waypoint.dev", color: "var(--chart-4)" },
  { id: "m5", name: "Ana Duarte", role: "Product Manager", email: "ana@waypoint.dev", color: "var(--chart-3)" },
];

export const labels: Label[] = [
  { id: "l1", name: "frontend", tone: "primary" },
  { id: "l2", name: "backend", tone: "info" },
  { id: "l3", name: "design", tone: "warning" },
  { id: "l4", name: "bug", tone: "destructive" },
  { id: "l5", name: "infra", tone: "success" },
];

export const projects: Project[] = [
  {
    id: "p1",
    name: "Atlas Web App",
    key: "ATL",
    description: "Customer-facing dashboard rebuild with the new design system.",
    status: "active",
    priority: "high",
    dueDate: iso(addDays(today, 24)),
    memberIds: ["m1", "m2", "m3"],
  },
  {
    id: "p2",
    name: "Billing Migration",
    key: "BIL",
    description: "Move invoicing off the legacy service and onto usage-based billing.",
    status: "on_hold",
    priority: "urgent",
    dueDate: iso(addDays(today, 9)),
    memberIds: ["m4", "m5", "m1"],
  },
  {
    id: "p3",
    name: "Mobile Companion",
    key: "MOB",
    description: "Read-only mobile client for boards, tasks and notifications.",
    status: "active",
    priority: "medium",
    dueDate: iso(addDays(today, 52)),
    memberIds: ["m2", "m3"],
  },
  {
    id: "p4",
    name: "Design System 2.0",
    key: "DS2",
    description: "Token overhaul, dark theme parity and component audit.",
    status: "active",
    priority: "high",
    dueDate: iso(addDays(today, 4)),
    memberIds: ["m3", "m1", "m5"],
  },
];

const titles = [
  "Wire up board drag interactions",
  "Audit color tokens for contrast",
  "Split invoice worker into queues",
  "Empty state illustrations",
  "Task slide-over deep links",
  "Reduce bundle on first paint",
  "Usage metering edge cases",
  "Keyboard shortcut layer",
  "Mobile bottom nav polish",
  "Migrate legacy webhooks",
  "Analytics query caching",
  "Sidebar collapse persistence",
  "Comment thread pagination",
  "Retry logic for failed syncs",
  "Onboarding checklist copy",
  "Column virtualization spike",
  "Label picker multi-select",
  "Due date reschedule drag",
  "Profile settings form",
  "Workspace role matrix",
];

const statuses = ["backlog", "todo", "in_progress", "in_review", "done"] as const;
const priorities = ["urgent", "high", "medium", "low"] as const;

export const tasks: Task[] = titles.flatMap((title, i) => {
  const project = projects[i % projects.length]!;
  const status = statuses[(i * 3) % statuses.length]!;
  const overdue = i % 7 === 0;
  return [
    {
      id: `t${i + 1}`,
      projectId: project.id,
      title,
      status,
      priority: priorities[i % priorities.length]!,
      assigneeId: i % 6 === 5 ? null : members[i % members.length]!.id,
      labelIds: [labels[i % labels.length]!.id, ...(i % 4 === 0 ? [labels[(i + 2) % labels.length]!.id] : [])],
      dueDate: iso(overdue ? subDays(today, (i % 5) + 1) : addDays(today, (i % 14) + 1)),
      createdAt: iso(subDays(today, 30 - (i % 25))),
      commentCount: i % 5,
      checklistDone: i % 4,
      checklistTotal: (i % 4) + 2,
    },
  ];
});

export const activity: ActivityEntry[] = [
  { id: "a1", memberId: "m1", action: "changed priority to High on", target: "Usage metering edge cases", projectId: "p2", at: "18 minutes ago" },
  { id: "a2", memberId: "m3", action: "moved", target: "Audit color tokens for contrast", projectId: "p4", at: "1 hour ago" },
  { id: "a3", memberId: "m2", action: "commented on", target: "Wire up board drag interactions", projectId: "p1", at: "2 hours ago" },
  { id: "a4", memberId: "m5", action: "created", target: "Workspace role matrix", projectId: "p1", at: "4 hours ago" },
  { id: "a5", memberId: "m4", action: "completed", target: "Migrate legacy webhooks", projectId: "p2", at: "Yesterday" },
  { id: "a6", memberId: "m1", action: "assigned Mira to", target: "Empty state illustrations", projectId: "p4", at: "Yesterday" },
];
