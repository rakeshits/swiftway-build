import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function StagePlaceholder({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="panel p-5">
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        className="border-0 bg-transparent py-10"
      />
    </div>
  );
}
