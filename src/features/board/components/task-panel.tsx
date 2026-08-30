import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Check, Plus, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { getLabels, getMembers } from "@/features/workspace/api";
import {
  addChecklistItem,
  addComment,
  addSubtask,
  boardColumns,
  deleteChecklistItem,
  deleteSubtask,
  getTaskDetail,
  toggleChecklistItem,
  toggleSubtask,
  updateTask,
  type TaskDetail,
  type TaskPatch,
} from "@/features/board/api";
import type { Label as LabelType, Priority } from "@/features/workspace/types";
import { cn } from "@/lib/utils";

const priorities: Priority[] = ["urgent", "high", "medium", "low"];

const labelTone: Record<LabelType["tone"], string> = {
  primary: "border-primary/30 bg-primary/12 text-primary",
  info: "border-info/30 bg-info/12 text-info",
  warning: "border-warning/30 bg-warning/12 text-warning",
  success: "border-success/30 bg-success/12 text-success",
  destructive: "border-destructive/30 bg-destructive/12 text-destructive",
};

export function TaskPanel({ taskId, onClose }: { taskId: string | undefined; onClose: () => void }) {
  useEffect(() => {
    if (!taskId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [taskId, onClose]);

  return (
    <AnimatePresence>
      {taskId ? (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-background/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Task details"
            className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-border bg-surface shadow-2xl"
            initial={{ x: "100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.4 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <PanelBody taskId={taskId} onClose={onClose} />
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function PanelBody({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const task = useQuery({ queryKey: ["task", taskId], queryFn: () => getTaskDetail(taskId) });
  const membersQuery = useQuery({ queryKey: ["members"], queryFn: getMembers });
  const labelsQuery = useQuery({ queryKey: ["labels"], queryFn: getLabels });

  const settle = (next: TaskDetail) => {
    qc.setQueryData(["task", taskId], next);
    void qc.invalidateQueries({ queryKey: ["board", next.projectId] });
    void qc.invalidateQueries({ queryKey: ["projects"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const patch = useMutation({
    mutationFn: (values: TaskPatch) => updateTask(taskId, values),
    onSuccess: settle,
    onError: () => toast.error("Could not save that change"),
  });

  const checklistAdd = useMutation({ mutationFn: addChecklistItem, onSuccess: settle });
  const checklistToggle = useMutation({ mutationFn: toggleChecklistItem, onSuccess: settle });
  const checklistRemove = useMutation({ mutationFn: deleteChecklistItem, onSuccess: settle });
  const subtaskAdd = useMutation({ mutationFn: addSubtask, onSuccess: settle });
  const subtaskToggle = useMutation({ mutationFn: toggleSubtask, onSuccess: settle });
  const subtaskRemove = useMutation({ mutationFn: deleteSubtask, onSuccess: settle });
  const commentAdd = useMutation({ mutationFn: addComment, onSuccess: settle });

  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [checkDraft, setCheckDraft] = useState("");
  const [subDraft, setSubDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");

  const data = task.data;

  useEffect(() => {
    if (data) {
      setTitleDraft(data.title);
      setDescDraft(data.description);
    }
  }, [data?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (task.isLoading) {
    return (
      <>
        <PanelHeader taskId={taskId} onClose={onClose} />
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PanelHeader taskId={taskId} onClose={onClose} />
        <div className="p-5 text-sm text-muted-foreground">This task no longer exists.</div>
      </>
    );
  }

  const checklistDone = data.checklist.filter((c) => c.done).length;
  const checklistPct = data.checklist.length
    ? Math.round((checklistDone / data.checklist.length) * 100)
    : 0;
  const activeLabelIds = data.labels.map((l) => l.id);

  const toggleLabel = (id: string) =>
    patch.mutate({
      labelIds: activeLabelIds.includes(id)
        ? activeLabelIds.filter((l) => l !== id)
        : [...activeLabelIds, id],
    });

  return (
    <>
      <PanelHeader taskId={taskId} onClose={onClose} saving={patch.isPending} />

      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {/* Title */}
        <Input
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={() => {
            const next = titleDraft.trim();
            if (next && next !== data.title) patch.mutate({ title: next });
            else setTitleDraft(data.title);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          aria-label="Task title"
          className="h-auto border-transparent bg-transparent px-0 text-lg font-semibold tracking-tight shadow-none focus-visible:border-border focus-visible:px-3"
        />

        {/* Fields */}
        <div className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2">
          <Field label="Status">
            <Select
              value={data.status}
              onValueChange={(value) => patch.mutate({ status: value as TaskDetail["status"] })}
            >
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {boardColumns.map((c) => (
                  <SelectItem key={c.status} value={c.status}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Priority">
            <Select
              value={data.priority}
              onValueChange={(value) => patch.mutate({ priority: value as Priority })}
            >
              <SelectTrigger className="h-8 text-sm capitalize"><SelectValue /></SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Assignee">
            <Select
              value={data.assigneeId ?? "unassigned"}
              onValueChange={(value) =>
                patch.mutate({ assigneeId: value === "unassigned" ? null : value })
              }
            >
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {(membersQuery.data ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Due date">
            <Input
              type="date"
              value={data.dueDate ?? ""}
              onChange={(e) => patch.mutate({ dueDate: e.target.value || null })}
              className="text-numeric h-8 text-sm"
              aria-label="Due date"
            />
          </Field>
        </div>

        {/* Labels */}
        <Section title="Labels">
          <div className="flex flex-wrap gap-1.5">
            {(labelsQuery.data ?? []).map((label) => {
              const active = activeLabelIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={cn(
                    "rounded border px-1.5 py-0.5 text-[11px] transition-colors",
                    active
                      ? labelTone[label.tone]
                      : "border-border bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label.name}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Description */}
        <Section title="Description">
          <Textarea
            rows={4}
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={() => {
              if (descDraft.trim() !== data.description) patch.mutate({ description: descDraft.trim() });
            }}
            className="resize-none text-sm"
            aria-label="Task description"
          />
        </Section>

        {/* Checklist */}
        <Section
          title="Checklist"
          action={
            <span className="text-numeric text-xs text-muted-foreground">
              {checklistDone}/{data.checklist.length}
            </span>
          }
        >
          <Progress value={checklistPct} className="mb-3 h-1.5" />
          <ul className="space-y-1.5">
            {data.checklist.map((item) => (
              <li key={item.id} className="group flex items-center gap-2.5">
                <Checkbox
                  checked={item.done}
                  onCheckedChange={() => checklistToggle.mutate({ taskId, itemId: item.id })}
                  aria-label={item.text}
                />
                <span className={cn("flex-1 text-sm", item.done && "text-muted-foreground line-through")}>
                  {item.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={`Delete ${item.text}`}
                  onClick={() => checklistRemove.mutate({ taskId, itemId: item.id })}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
          <InlineAdd
            value={checkDraft}
            onChange={setCheckDraft}
            placeholder="Add a checklist item"
            onSubmit={() => {
              const text = checkDraft.trim();
              if (!text) return;
              checklistAdd.mutate({ taskId, text });
              setCheckDraft("");
            }}
          />
        </Section>

        {/* Subtasks */}
        <Section
          title="Subtasks"
          action={
            <span className="text-numeric text-xs text-muted-foreground">
              {data.subtasks.filter((s) => s.done).length}/{data.subtasks.length}
            </span>
          }
        >
          <ul className="divide-y divide-border rounded-lg border border-border">
            {data.subtasks.length === 0 && (
              <li className="px-3 py-3 text-xs text-muted-foreground">No subtasks yet.</li>
            )}
            {data.subtasks.map((sub) => (
              <li key={sub.id} className="group flex items-center gap-2.5 px-3 py-2">
                <Checkbox
                  checked={sub.done}
                  onCheckedChange={() => subtaskToggle.mutate({ taskId, subtaskId: sub.id })}
                  aria-label={sub.title}
                />
                <span className={cn("flex-1 text-sm", sub.done && "text-muted-foreground line-through")}>
                  {sub.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={`Delete ${sub.title}`}
                  onClick={() => subtaskRemove.mutate({ taskId, subtaskId: sub.id })}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
          <InlineAdd
            value={subDraft}
            onChange={setSubDraft}
            placeholder="Add a subtask"
            onSubmit={() => {
              const title = subDraft.trim();
              if (!title) return;
              subtaskAdd.mutate({ taskId, title });
              setSubDraft("");
            }}
          />
        </Section>

        {/* Comments */}
        <Section title={`Comments (${data.comments.length})`}>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {data.comments.length === 0 && (
              <p className="text-xs text-muted-foreground">No comments yet — start the thread.</p>
            )}
            {data.comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <MemberAvatar member={comment.member} size="xs" />
                <div className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium">{comment.member.name}</span>
                    <span className="text-numeric text-[11px] text-muted-foreground">
                      {relative(comment.at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{comment.body}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            className="mt-3 flex items-start gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const body = commentDraft.trim();
              if (!body) return;
              commentAdd.mutate({ taskId, body });
              setCommentDraft("");
            }}
          >
            <Textarea
              rows={2}
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              placeholder="Write a comment…"
              className="resize-none text-sm"
              aria-label="New comment"
            />
            <Button type="submit" size="icon" className="size-9 shrink-0" aria-label="Post comment">
              <Send className="size-4" />
            </Button>
          </form>
        </Section>

        {/* Activity */}
        <Section title="Activity">
          <ol className="space-y-3">
            {data.events.map((event) => (
              <li key={event.id} className="flex gap-2.5 text-sm">
                <MemberAvatar member={event.member} size="xs" />
                <p className="min-w-0 flex-1 text-muted-foreground">
                  <span className="font-medium text-foreground">{event.member.name}</span>{" "}
                  {event.message}
                  <span className="text-numeric ml-1.5 text-[11px]">{relative(event.at)}</span>
                </p>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </>
  );
}

function PanelHeader({
  taskId,
  onClose,
  saving,
}: {
  taskId: string;
  onClose: () => void;
  saving?: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
      <span className="text-numeric text-xs text-muted-foreground">{taskId.toUpperCase()}</span>
      <div className="flex items-center gap-2">
        {saving && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Check className="size-3" /> saving…
          </span>
        )}
        <Button variant="ghost" size="icon" className="size-8" onClick={onClose} aria-label="Close task panel">
          <X className="size-4" />
        </Button>
      </div>
    </header>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function InlineAdd({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
}) {
  return (
    <form
      className="mt-2 flex items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
        aria-label={placeholder}
      />
      <Button type="submit" variant="ghost" size="icon" className="size-8" aria-label={placeholder}>
        <Plus className="size-4" />
      </Button>
    </form>
  );
}

function relative(at: string) {
  try {
    return `${formatDistanceToNow(parseISO(at))} ago`;
  } catch {
    return format(new Date(), "MMM d");
  }
}
