import { Suspense } from "react";
import { redirect } from "next/navigation";

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
  const { workspaceId } = params;

  const { member } = await api.workspace.findMember.query({
    workspaceId,
  });

  if (!member) {
    redirect(`/select-workspace`);
  }

  const { workspace } = await api.workspace.getWorkspaceById.query({
    workspaceId,
  });

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
