import { activity, members, projects, tasks } from "@/features/workspace/mock-data";
import type { ActivityEntry, Member, Project } from "@/features/workspace/types";

/** Simulated network latency so loading states are real and testable. */
const latency = () => 200 + Math.round(Math.random() * 100);

function delayed<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), latency()));
}

export type ProjectInput = Pick<
  Project,
  "name" | "description" | "status" | "priority" | "dueDate"
>;

export type ProjectSummary = Project & {
  progress: number;
  taskCount: number;
  doneCount: number;
  members: Member[];
};

function progressFor(projectId: string) {
  const list = tasks.filter((t) => t.projectId === projectId);
  const done = list.filter((t) => t.status === "done").length;
  return {
    taskCount: list.length,
    doneCount: done,
    progress: list.length ? Math.round((done / list.length) * 100) : 0,
  };
}

function summarize(project: Project): ProjectSummary {
  return {
    ...project,
    ...progressFor(project.id),
    members: project.memberIds
      .map((id) => members.find((m) => m.id === id))
      .filter((m): m is Member => Boolean(m)),
  };
}

export const listProjects = (): Promise<ProjectSummary[]> => delayed(projects.map(summarize));

export const getProject = (projectId: string): Promise<ProjectSummary | null> => {
  const found = projects.find((p) => p.id === projectId);
  return delayed(found ? summarize(found) : null);
};

function nextKey(name: string) {
  const base = name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "PRJ";
  let key = base;
  let n = 1;
  while (projects.some((p) => p.key === key)) key = `${base}${++n}`;
  return key;
}

export async function createProject(input: ProjectInput): Promise<ProjectSummary> {
  const project: Project = {
    id: `p${Date.now()}`,
    key: nextKey(input.name),
    memberIds: members.slice(0, 3).map((m) => m.id),
    ...input,
  };
  projects.push(project);
  return delayed(summarize(project));
}

export async function updateProject(
  projectId: string,
  patch: Partial<ProjectInput>,
): Promise<ProjectSummary> {
  const project = projects.find((p) => p.id === projectId);
  if (!project) throw new Error("Project not found");
  Object.assign(project, patch);
  return delayed(summarize(project));
}

export async function duplicateProject(projectId: string): Promise<ProjectSummary> {
  const project = projects.find((p) => p.id === projectId);
  if (!project) throw new Error("Project not found");
  const copy: Project = {
    ...project,
    id: `p${Date.now()}`,
    name: `${project.name} (copy)`,
    key: nextKey(project.name),
  };
  projects.push(copy);
  return delayed(summarize(copy));
}

export const archiveProject = (projectId: string) =>
  updateProject(projectId, { status: "archived" });

export async function deleteProject(projectId: string): Promise<{ id: string }> {
  const index = projects.findIndex((p) => p.id === projectId);
  if (index >= 0) projects.splice(index, 1);
  return delayed({ id: projectId });
}

export type ProjectActivityItem = ActivityEntry & { member: Member };

export async function getProjectActivity(projectId: string): Promise<ProjectActivityItem[]> {
  const scoped = activity
    .filter((a) => a.projectId === projectId)
    .map((a) => ({ ...a, member: members.find((m) => m.id === a.memberId)! }));
  return delayed(scoped);
}
