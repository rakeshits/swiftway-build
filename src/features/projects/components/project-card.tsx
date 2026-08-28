import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { CalendarDays, Copy, MoreHorizontal, Pencil, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarStack } from "@/components/shared/member-avatar";
import type { ProjectSummary } from "@/features/projects/api";
import { PriorityIndicator, StatusBadge } from "./project-meta";

export function ProjectCardSkeleton() {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <Skeleton className="mt-6 h-1.5 w-full rounded-full" />
      <div className="mt-5 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function ProjectCard({
  project,
  index = 0,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  project: ProjectSummary;
  index?: number;
  onEdit: (project: ProjectSummary) => void;
  onDuplicate: (project: ProjectSummary) => void;
  onArchive: (project: ProjectSummary) => void;
  onDelete: (project: ProjectSummary) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03, ease: "easeOut" }}
      className="panel group relative flex flex-col p-5 transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-numeric rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {project.key}
            </span>
            <StatusBadge status={project.status} />
          </div>
          <h3 className="mt-2 truncate text-sm font-semibold">
            <Link
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              className="hover:text-primary"
            >
              {project.name}
            </Link>
          </h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Project actions for ${project.name}`}
              className="size-7 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(project)}>
              <Copy className="size-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onArchive(project)}
              disabled={project.status === "archived"}
            >
              <Archive className="size-4" /> Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(project)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {project.doneCount}/{project.taskCount} tasks
          </span>
          <span className="text-numeric font-medium">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-1.5" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <AvatarStack members={project.members} max={4} />
        <div className="flex items-center gap-3">
          <PriorityIndicator priority={project.priority} />
          <span className="text-numeric inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {format(parseISO(project.dueDate), "MMM d")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
