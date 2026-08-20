import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ShipmentsLoading() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="mt-3 h-5 w-72" />
          </div>
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </AppShell>
  );
}
