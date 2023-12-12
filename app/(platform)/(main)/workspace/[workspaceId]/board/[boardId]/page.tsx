import { Metadata } from "next";
import { startCase } from "lodash";

import { api } from "@/trpc/server";

export async function generateMetadata({
  params,
}: BoardIdPageProps): Promise<Metadata> {
  const { title } = await api.board.getTitle.query({
    boardId: params.boardId,
  });

  return {
    title: startCase(title || "Board"),
  };
}

interface BoardIdPageProps {
  params: {
    workspaceId: string;
    boardId: string;
  };
}

const BoardPage = () => {
  return <div>Board Page</div>;
};

export default BoardPage;
