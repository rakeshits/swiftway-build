import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { boardColumns, createTask } from "@/features/board/api";
import { getMembers, getProjects } from "@/features/workspace/api";
import type { Priority, TaskStatus } from "@/features/workspace/types";

const schema = z.object({
  projectId: z.string().min(1, "Choose a project for this task."),
  title: z
    .string()
    .trim()
    .min(3, "Task titles need at least 3 characters.")
    .max(100, "Keep the title under 100 characters."),
  description: z.string().trim().max(400, "Descriptions are capped at 400 characters."),
  status: z.enum(["backlog", "todo", "in_progress", "in_review", "done"]),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  assigneeId: z.string(),
  dueDate: z.string(),
});

type TaskFormValues = z.infer<typeof schema>;

const priorities: Priority[] = ["urgent", "high", "medium", "low"];

export function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Preselects (and locks) the project when opened from a project view. */
  projectId?: string;
}) {
  const qc = useQueryClient();
  const projects = useQuery({ queryKey: ["projects"], queryFn: getProjects });
  const members = useQuery({ queryKey: ["members"], queryFn: getMembers });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      projectId: projectId ?? "",
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assigneeId: "unassigned",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        projectId: projectId ?? projects.data?.[0]?.id ?? "",
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assigneeId: "unassigned",
        dueDate: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId, projects.data]);

  const create = useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      void qc.invalidateQueries({ queryKey: ["board", task.projectId] });
      void qc.invalidateQueries({ queryKey: ["projects"] });
      void qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      void qc.invalidateQueries({ queryKey: ["deadlines"] });
      toast.success(`Created “${task.title}”`);
      onOpenChange(false);
    },
    onError: () => toast.error("Could not create the task"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>
            Tasks live inside a project and show up on its board immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) =>
              create.mutate({
                projectId: values.projectId,
                title: values.title,
                status: values.status as TaskStatus,
                description: values.description,
                priority: values.priority as Priority,
                assigneeId: values.assigneeId === "unassigned" ? null : values.assigneeId,
                dueDate: values.dueDate || null,
              }),
            )}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Wire up board drag interactions" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} className="resize-none" placeholder="Add context…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!projectId && (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(projects.data ?? []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {boardColumns.map((c) => (
                          <SelectItem key={c.status} value={c.status}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="capitalize">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p} className="capitalize">
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {(members.data ?? []).map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" className="text-numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending}>
                Create task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
