import { Skeleton } from "@/components/ui/skeleton";
import { ActivityItem } from "@/components/activity-item";
import { api } from "@/trpc/server";

interface ActivityListProps {
  workspaceId: string;
}

export const ActivityList = async ({ workspaceId }: ActivityListProps) => {
  const auditLogs = await api.auditLog.getAllLogs.query({
    workspaceId,
  });

  return (
    <ol className="mt-4 space-y-4">
      <p className="hidden text-center text-xs text-muted-foreground last:block">
        No activity found inside this workspace
      </p>
      {auditLogs?.map((auditLog) => (
        <ActivityItem key={auditLog.id} data={auditLog} />
      ))}
    </ol>
  );
};

ActivityList.Skeleton = function ActivityListSkeleton() {
  return (
    <ol className="mt-4 space-y-4">
      <Skeleton className="h-14 w-[80%]" />
      <Skeleton className="h-14 w-[50%]" />
      <Skeleton className="h-14 w-[70%]" />
      <Skeleton className="h-14 w-[80%]" />
      <Skeleton className="h-14 w-[75%]" />
    </ol>
  );
};
