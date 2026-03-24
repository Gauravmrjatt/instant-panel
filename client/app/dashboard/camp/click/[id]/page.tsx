import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ClickDetailsContent from "./click-details-content";

export default async function ClickDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ event?: string }>;
}) {
  const { id } = await params;
  const { event } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="space-y-6  w-full animate-pulse">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      }
    >
      <ClickDetailsContent clickId={id} event={event || ""} />
    </Suspense>
  );
}
