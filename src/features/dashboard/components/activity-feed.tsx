import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { MemberAvatar } from "@/components/shared/member-avatar";
import type { ActivityItem } from "@/features/workspace/api";

export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-full max-w-[220px]" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Once your team starts moving tasks around, their updates land here."
        className="border-0 bg-transparent py-8"
      />
    );
  }

  return (
    <ol className="relative space-y-4">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3">
          <MemberAvatar member={item.member} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug">
              <span className="font-medium">{item.member.name.split(" ")[0]}</span>{" "}
              <span className="text-muted-foreground">{item.action}</span>{" "}
              <span className="font-medium">{item.target}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.projectName} · {item.at}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
