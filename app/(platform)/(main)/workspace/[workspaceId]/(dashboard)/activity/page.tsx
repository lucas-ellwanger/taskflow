import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getUserAuth } from "@/lib/auth/utils";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

import { Info } from "../_components/info";
import { ActivityList } from "./_components/activity-list";

interface ActivityPageProps {
  params: {
    workspaceId: string;
  };
}

const ActivityPage = async ({ params }: ActivityPageProps) => {
  const { session } = await getUserAuth();
  const { workspaceId } = params;

  const { workspace } = await api.workspace.getWorkspaceById.query({
    workspaceId,
  });

  if (!workspace) {
    redirect(`/select-workspace`);
  }

  // if user is not the workspace owner, checks if user is a member
  if (workspace.userId !== session?.user.id) {
    const { member } = await api.workspace.findMember.query({
      workspaceId,
    });

    if (!member) {
      redirect(`/select-workspace`);
    }
  }

  return (
    <div className="w-full">
      <Info workspace={workspace} />
      <Separator className="my-4" />
      <Suspense fallback={<ActivityList.Skeleton />}>
        <ActivityList workspaceId={workspace.id} />
        <div className="h-6" />
      </Suspense>
    </div>
  );
};

export default ActivityPage;
