import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProject, updateProject, type ProjectInput } from "@/features/projects/api";
import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog";
import { PriorityIndicator, StatusBadge } from "@/features/projects/components/project-meta";

export const Route = createFileRoute("/_shell/projects/$projectId/settings")({
  component: ProjectSettings,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

function ProjectSettings() {
  const { projectId } = Route.useParams();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const project = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProject(projectId),
  });

  const update = useMutation({
    mutationFn: (values: ProjectInput) => updateProject(projectId, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      toast.success("Project settings saved");
    },
  });

  if (!project.data) {
    return (
      <div className="panel space-y-3 p-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  const p = project.data;

  return (
    <section className="panel p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Project settings</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Details shown across the workspace. Task-level configuration comes with the board.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="size-4" /> Edit
        </Button>
      </div>

      <div>
        <Row label="Name">{p.name}</Row>
        <Row label="Key">
          <span className="text-numeric">{p.key}</span>
        </Row>
        <Row label="Status">
          <StatusBadge status={p.status} />
        </Row>
        <Row label="Priority">
          <PriorityIndicator priority={p.priority} />
        </Row>
        <Row label="Due date">
          <span className="text-numeric">{format(parseISO(p.dueDate), "MMM d, yyyy")}</span>
        </Row>
        <Row label="Members">{p.members.length}</Row>
        <Row label="Tasks">
          <span className="text-numeric">
            {p.doneCount}/{p.taskCount} done
          </span>
        </Row>
      </div>

      <ProjectFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="edit"
        pending={update.isPending}
        defaultValues={{
          name: p.name,
          description: p.description,
          status: p.status,
          priority: p.priority,
          dueDate: p.dueDate,
        }}
        onSubmit={(values) => update.mutate(values)}
      />
    </section>
  );
}
