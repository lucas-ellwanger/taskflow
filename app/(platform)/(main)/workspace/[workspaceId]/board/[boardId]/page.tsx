import { redirect } from "next/navigation";

import { getUserAuth } from "@/lib/auth/utils";
import { api } from "@/trpc/server";

import { ListContainer } from "./_components/list-container";

interface BoardIdPageProps {
  params: {
    boardId: string;
    workspaceId: string;
  };
}

const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  const { session } = await getUserAuth();

  if (!session) {
    redirect("/select-workspace");
  }

  const { lists } = await api.list.getListsWithCards.query({
    boardId: params.boardId,
  });

  return (
    <div className="h-full overflow-x-auto p-4">
      <ListContainer
        boardId={params.boardId}
        workspaceId={params.workspaceId}
        data={lists}
      />
    </div>
  );
};

export default BoardIdPage;
