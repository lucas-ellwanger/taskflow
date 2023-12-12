import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { startCase } from "lodash";

import { api } from "@/trpc/server";

import { BoardNavbar } from "./_components/board-navbar";

export async function generateMetadata({
  params,
}: {
  params: {
    boardId: string;
    workspaceId: string;
  };
}): Promise<Metadata> {
  const { board } = await api.board.getBoard.query({
    boardId: params.boardId,
    workspaceId: params.workspaceId,
  });

  return {
    title: startCase(board?.title || "Board"),
  };
}

interface BoardIdLayoutProps {
  children: React.ReactNode;
  params: {
    boardId: string;
    workspaceId: string;
  };
}

const BoardIdLayout = async ({ children, params }: BoardIdLayoutProps) => {
  if (!params.workspaceId) {
    redirect("/select-workspace");
  }

  const { board } = await api.board.getBoard.query({
    boardId: params.boardId,
    workspaceId: params.workspaceId,
  });

  if (!board) {
    notFound();
  }

  return (
    <div
      className="relative h-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${board.imageFullUrl})` }}
    >
      <BoardNavbar board={board} />
      <div className="absolute inset-0 bg-black/10" />
      <main className="relative h-full pt-28">{children}</main>
    </div>
  );
};

export default BoardIdLayout;
