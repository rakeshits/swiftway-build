import { cn } from "@/lib/utils";
import type { Member } from "@/features/workspace/types";

const sizes = {
  xs: "size-5 text-[9px]",
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
};

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function MemberAvatar({
  member,
  size = "md",
  className,
}: {
  member: Pick<Member, "name" | "color">;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      title={member.name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border font-medium",
        sizes[size],
        className,
      )}
      style={{ backgroundColor: `color-mix(in oklab, ${member.color} 22%, transparent)`, color: member.color }}
    >
      {initials(member.name)}
    </span>
  );
}

export function AvatarStack({
  members,
  max = 3,
  size = "sm",
}: {
  members: Pick<Member, "id" | "name" | "color">[];
  max?: number;
  size?: keyof typeof sizes;
}) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((m) => (
        <MemberAvatar key={m.id} member={m} size={size} className="ring-2 ring-surface" />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-border bg-muted text-muted-foreground ring-2 ring-surface",
            sizes[size],
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
