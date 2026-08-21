export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done";
export type Priority = "urgent" | "high" | "medium" | "low";
export type ProjectStatus = "on_track" | "at_risk" | "off_track" | "completed" | "archived";

export type Member = {
  id: string;
  name: string;
  role: string;
  email: string;
  color: string;
};

export type Label = {
  id: string;
  name: string;
  tone: "primary" | "info" | "warning" | "success" | "destructive";
};

export type Project = {
  id: string;
  name: string;
  key: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  dueDate: string;
  memberIds: string[];
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  labelIds: string[];
  dueDate: string | null;
  createdAt: string;
  commentCount: number;
  checklistDone: number;
  checklistTotal: number;
};

export type ActivityEntry = {
  id: string;
  memberId: string;
  action: string;
  target: string;
  projectId: string;
  at: string;
};

export type DashboardStats = {
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
};

export type ThroughputPoint = {
  date: string;
  completed: number;
  created: number;
};
