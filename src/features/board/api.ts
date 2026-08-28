import { labels as allLabels, members, projects, tasks } from "@/features/workspace/mock-data";
import type { Label, Member, Task, TaskStatus } from "@/features/workspace/types";

/** Simulated network latency so loading states are real and testable. */
const latency = () => 180 + Math.round(Math.random() * 140);

function delayed<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), latency()));
}

export const boardColumns: { status: TaskStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "todo", label: "Todo" },
  { status: "in_progress", label: "In Progress" },
  { status: "in_review", label: "In Review" },
  { status: "done", label: "Done" },
];

export type BoardTask = Task & { assignee: Member | null; labels: Label[] };

function hydrate(task: Task): BoardTask {
  return {
    ...task,
    assignee: members.find((m) => m.id === task.assigneeId) ?? null,
    labels: task.labelIds
      .map((id) => allLabels.find((l) => l.id === id))
      .filter((l): l is Label => Boolean(l)),
  };
}

export const getBoardTasks = (projectId: string): Promise<BoardTask[]> =>
  delayed(tasks.filter((t) => t.projectId === projectId).map(hydrate));

export const getTask = (taskId: string): Promise<BoardTask | null> => {
  const found = tasks.find((t) => t.id === taskId);
  return delayed(found ? hydrate(found) : null);
};

/** Applies a new within-project ordering and (optionally) a new status for one task. */
export async function updateTaskStatus(input: {
  taskId: string;
  status: TaskStatus;
  orderedIds: string[];
}): Promise<BoardTask> {
  const task = tasks.find((t) => t.id === input.taskId);
  if (!task) throw new Error("Task not found");
  task.status = input.status;
  applyOrder(input.orderedIds);
  return delayed(hydrate(task));
}

export async function reorderTasks(input: {
  status: TaskStatus;
  orderedIds: string[];
}): Promise<{ status: TaskStatus }> {
  applyOrder(input.orderedIds);
  return delayed({ status: input.status });
}

/** Reorders the mock array so column ordering survives refetches. */
function applyOrder(orderedIds: string[]) {
  const positions = orderedIds
    .map((id) => tasks.findIndex((t) => t.id === id))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);
  const moved = orderedIds
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => Boolean(t));
  positions.forEach((position, i) => {
    tasks[position] = moved[i]!;
  });
}

export async function createTask(input: {
  projectId: string;
  title: string;
  status: TaskStatus;
}): Promise<BoardTask> {
  const project = projects.find((p) => p.id === input.projectId);
  if (!project) throw new Error("Project not found");
  const task: Task = {
    id: `t${Date.now()}`,
    projectId: input.projectId,
    title: input.title,
    status: input.status,
    priority: "medium",
    assigneeId: null,
    labelIds: [],
    dueDate: null,
    createdAt: new Date().toISOString().slice(0, 10),
    commentCount: 0,
    checklistDone: 0,
    checklistTotal: 0,
  };
  tasks.push(task);
  return delayed(hydrate(task));
}
