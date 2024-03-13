"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { HelpCircle, User2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { BoardPopover } from "@/components/board/board-popover";
import { Hint } from "@/components/hint";
import { api } from "@/trpc/react";

export const BoardList = () => {
  const params = useParams();

  const { data: boards, isLoading } = api.board.getBoards.useQuery({
    workspaceId: params.workspaceId as string,
  });

  if (!boards || isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
        <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
        <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
        <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
        <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
        <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center text-lg font-semibold text-neutral-700">
        <User2 className="mr-2 h-6 w-6" />
        Your boards
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/workspace/${board.workspaceId}/board/${board.id}`}
            style={{ backgroundImage: `url(${board.imageThumbUrl})` }}
            className="group relative aspect-video h-full w-full overflow-hidden rounded-md bg-muted bg-cover bg-center bg-no-repeat p-2"
          >
            <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/30" />
            <p className="relative ml-1 font-semibold text-white">
              {board.title}
            </p>
          </Link>
        ))}
        <BoardPopover sideOffset={10} side="right">
          <div
            role="button"
            className="relative flex aspect-video h-full w-full flex-col items-center justify-center gap-y-1 rounded-md bg-muted transition hover:opacity-75"
          >
            <p className="text-sm">Create new board</p>
            <span className="text-xs">5 remaining</span>
            <Hint
              sideOffset={40}
              description={`
              Free Workspaces can have up to 5 active boards. For unlimited boards upgrade this workspace.
            `}
            >
              <HelpCircle className="absolute bottom-2 right-2 h-[14px] w-[14px]" />
            </Hint>
          </div>
        </BoardPopover>
      </div>
    </div>
  );
};

// BoardList.Skeleton = function SkeletonBoardList() {
//   return (
//     <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
//       <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
//       <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
//       <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
//       <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
//       <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
//       <Skeleton className="aspect-video h-full w-full rounded-md p-2" />
//     </div>
//   );
// };
