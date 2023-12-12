import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getUserAuth } from "@/lib/auth/utils";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

import { BoardList } from "./_components/board-list";
import { Info, InfoSkeleton } from "./_components/info";

interface WorkspaceIdPageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdPage = async ({ params }: WorkspaceIdPageProps) => {
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
    <div className="mb-20 w-full">
      <Suspense fallback={<InfoSkeleton />}>
        <Info workspace={workspace} />
      </Suspense>
      <Separator className="my-4" />
      <div className="px-2 md:px-4">
        <Suspense fallback={<BoardList.Skeleton />}>
          <BoardList boards={workspace?.boards} />
        </Suspense>
      </div>
    </div>
  );
};

export default WorkspaceIdPage;
