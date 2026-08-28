import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  archiveProject,
  createProject,
  deleteProject,
  duplicateProject,
  listProjects,
  updateProject,
  type ProjectInput,
  type ProjectSummary,
} from "@/features/projects/api";
import { ProjectCard, ProjectCardSkeleton } from "@/features/projects/components/project-card";
import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog";

export const Route = createFileRoute("/_shell/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Waypoint" },
      {
        name: "description",
        content:
          "Every project in your Waypoint workspace with progress, owners, priority and due dates.",
      },
      { property: "og:title", content: "Projects — Waypoint" },
      {
        property: "og:description",
        content: "Track project progress, owners and deadlines across your workspace.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const qc = useQueryClient();
  const projects = useQuery({ queryKey: ["projects", "all"], queryFn: listProjects });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectSummary | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProjectSummary | null>(null);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["projects"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const create = useMutation({
    mutationFn: createProject,
    onSuccess: (p) => {
      refresh();
      setFormOpen(false);
      toast.success(`${p.name} created`);
    },
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProjectInput }) => updateProject(id, values),
    onSuccess: (p) => {
      refresh();
      setFormOpen(false);
      setEditing(null);
      toast.success(`${p.name} updated`);
    },
  });

  const duplicate = useMutation({
    mutationFn: duplicateProject,
    onSuccess: (p) => {
      refresh();
      toast.success(`Duplicated as ${p.name}`);
    },
  });

  const archive = useMutation({
    mutationFn: archiveProject,
    onSuccess: (p) => {
      refresh();
      toast.success(`${p.name} archived`);
    },
  });

  const remove = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      refresh();
      setPendingDelete(null);
      toast.success("Project deleted");
    },
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (project: ProjectSummary) => {
    setEditing(project);
    setFormOpen(true);
  };

  const isEmpty = !projects.isLoading && (projects.data?.length ?? 0) === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Every stream of work in the workspace, with live progress."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> New project
          </Button>
        }
      />

      {projects.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={FolderPlus}
          title="No projects yet"
          description="Projects hold your tasks, deadlines and team. Create the first one and Waypoint starts tracking progress for you."
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" /> Create your first project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.data!.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onEdit={openEdit}
              onDuplicate={(p) => duplicate.mutate(p.id)}
              onArchive={(p) => archive.mutate(p.id)}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        mode={editing ? "edit" : "create"}
        pending={create.isPending || update.isPending}
        defaultValues={
          editing
            ? {
                name: editing.name,
                description: editing.description,
                status: editing.status,
                priority: editing.priority,
                dueDate: editing.dueDate,
              }
            : undefined
        }
        onSubmit={(values) =>
          editing ? update.mutate({ id: editing.id, values }) : create.mutate(values)
        }
      />

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{pendingDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the project and detaches its {pendingDelete?.taskCount ?? 0}{" "}
              tasks. This can’t be undone — archive it instead if you might need it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => pendingDelete && remove.mutate(pendingDelete.id)}
            >
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
