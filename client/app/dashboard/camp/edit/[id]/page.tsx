import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import EditCampaignContent from "@/app/dashboard/camp/edit/[id]/edit-page-content";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="space-y-6  w-full animate-pulse">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      }
    >
      <EditCampaignContent campaignId={id} />
    </Suspense>
  );
}
