import { Hammer } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export function ComingSoon({
  title,
  description,
  stage,
}: {
  title: string;
  description: string;
  stage: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={Hammer}
        title={`${title} arrives in ${stage}`}
        description="The app shell and dashboard are in place first. This surface is next in the build order."
      />
    </div>
  );
}
