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

/* ---------------------------------------------------------------- Task detail */

import {
  checklistItems,
  subtasks as allSubtasks,
  taskComments,
  taskEvents,
} from "@/features/workspace/mock-data";
import type {
  ChecklistItem,
  Priority,
  Subtask,
  TaskComment,
  TaskEvent,
} from "@/features/workspace/types";

/** The signed-in member for the mock layer. */
const me = () => members[0]!;

export type TaskDetail = BoardTask & {
  description: string;
  checklist: ChecklistItem[];
  subtasks: Subtask[];
  comments: (TaskComment & { member: Member })[];
  events: (TaskEvent & { member: Member })[];
};

const descriptions = new Map<string, string>();

function log(taskId: string, message: string) {
  taskEvents.push({
    id: `ev-${taskId}-${Date.now()}`,
    taskId,
    memberId: me().id,
    message,
    at: new Date().toISOString(),
  });
}

function syncCounts(taskId: string) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  const list = checklistItems.filter((c) => c.taskId === taskId);
  task.checklistTotal = list.length;
  task.checklistDone = list.filter((c) => c.done).length;
  task.commentCount = taskComments.filter((c) => c.taskId === taskId).length;
}

function detail(taskId: string): TaskDetail | null {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;
  return {
    ...hydrate(task),
    description:
      descriptions.get(taskId) ??
      "No description yet. Add context, links or acceptance criteria so anyone can pick this up.",
    checklist: checklistItems.filter((c) => c.taskId === taskId),
    subtasks: allSubtasks.filter((s) => s.taskId === taskId),
    comments: taskComments
      .filter((c) => c.taskId === taskId)
      .map((c) => ({ ...c, member: members.find((m) => m.id === c.memberId) ?? me() })),
    events: taskEvents
      .filter((e) => e.taskId === taskId)
      .map((e) => ({ ...e, member: members.find((m) => m.id === e.memberId) ?? me() }))
      .sort((a, b) => (a.at < b.at ? 1 : -1)),
  };
}

export const getTaskDetail = (taskId: string): Promise<TaskDetail | null> => delayed(detail(taskId));

export type TaskPatch = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string | null;
  dueDate?: string | null;
  labelIds?: string[];
};

export async function updateTask(taskId: string, patch: TaskPatch): Promise<TaskDetail> {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) throw new Error("Task not found");

  if (patch.title !== undefined && patch.title !== task.title) {
    log(taskId, `renamed this task to “${patch.title}”`);
    task.title = patch.title;
  }
  if (patch.description !== undefined && patch.description !== descriptions.get(taskId)) {
    descriptions.set(taskId, patch.description);
    log(taskId, "updated the description");
  }
  if (patch.status && patch.status !== task.status) {
    const label = boardColumns.find((c) => c.status === patch.status)?.label ?? patch.status;
    log(taskId, `moved this task to ${label}`);
    task.status = patch.status;
  }
  if (patch.priority && patch.priority !== task.priority) {
    log(taskId, `changed priority to ${patch.priority}`);
    task.priority = patch.priority;
  }
  if (patch.assigneeId !== undefined && patch.assigneeId !== task.assigneeId) {
    const name = members.find((m) => m.id === patch.assigneeId)?.name;
    log(taskId, name ? `assigned this task to ${name}` : "removed the assignee");
    task.assigneeId = patch.assigneeId;
  }
  if (patch.dueDate !== undefined && patch.dueDate !== task.dueDate) {
    log(taskId, patch.dueDate ? `set the due date to ${patch.dueDate}` : "cleared the due date");
    task.dueDate = patch.dueDate;
  }
  if (patch.labelIds) {
    const changed = patch.labelIds.join(",") !== task.labelIds.join(",");
    task.labelIds = patch.labelIds;
    if (changed) log(taskId, "updated the labels");
  }

  return delayed(detail(taskId)!);
}

export async function addChecklistItem(input: { taskId: string; text: string }) {
  checklistItems.push({
    id: `c-${input.taskId}-${Date.now()}`,
    taskId: input.taskId,
    text: input.text,
    done: false,
  });
  syncCounts(input.taskId);
  log(input.taskId, `added “${input.text}” to the checklist`);
  return delayed(detail(input.taskId)!);
}

export async function toggleChecklistItem(input: { taskId: string; itemId: string }) {
  const item = checklistItems.find((c) => c.id === input.itemId);
  if (item) {
    item.done = !item.done;
    syncCounts(input.taskId);
    log(input.taskId, `${item.done ? "completed" : "reopened"} “${item.text}”`);
  }
  return delayed(detail(input.taskId)!);
}

export async function deleteChecklistItem(input: { taskId: string; itemId: string }) {
  const index = checklistItems.findIndex((c) => c.id === input.itemId);
  if (index >= 0) {
    const [removed] = checklistItems.splice(index, 1);
    syncCounts(input.taskId);
    log(input.taskId, `removed “${removed!.text}” from the checklist`);
  }
  return delayed(detail(input.taskId)!);
}

export async function addSubtask(input: { taskId: string; title: string }) {
  allSubtasks.push({
    id: `s-${input.taskId}-${Date.now()}`,
    taskId: input.taskId,
    title: input.title,
    done: false,
  });
  log(input.taskId, `added subtask “${input.title}”`);
  return delayed(detail(input.taskId)!);
}

export async function toggleSubtask(input: { taskId: string; subtaskId: string }) {
  const sub = allSubtasks.find((s) => s.id === input.subtaskId);
  if (sub) {
    sub.done = !sub.done;
    log(input.taskId, `${sub.done ? "completed" : "reopened"} subtask “${sub.title}”`);
  }
  return delayed(detail(input.taskId)!);
}

export async function deleteSubtask(input: { taskId: string; subtaskId: string }) {
  const index = allSubtasks.findIndex((s) => s.id === input.subtaskId);
  if (index >= 0) {
    const [removed] = allSubtasks.splice(index, 1);
    log(input.taskId, `removed subtask “${removed!.title}”`);
  }
  return delayed(detail(input.taskId)!);
}

export async function addComment(input: { taskId: string; body: string }) {
  taskComments.push({
    id: `cm-${input.taskId}-${Date.now()}`,
    taskId: input.taskId,
    memberId: me().id,
    body: input.body,
    at: new Date().toISOString(),
  });
  syncCounts(input.taskId);
  return delayed(detail(input.taskId)!);
}
