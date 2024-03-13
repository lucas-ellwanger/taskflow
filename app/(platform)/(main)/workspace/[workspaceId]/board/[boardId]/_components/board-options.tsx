"use client";

import { useParams, useRouter } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/trpc/react";

interface BoardOptionsProps {
  id: string;
}

export const BoardOptions = ({ id }: BoardOptionsProps) => {
  const params = useParams();
  const router = useRouter();
  const utils = api.useUtils();

  const workspaceId = params.workspaceId as string;

  const { mutate: deleteBoard, isLoading } = api.board.deleteBoard.useMutation({
    onSuccess: () => {
      toast.success("Board deleted");
      utils.board.getBoards.invalidate({ workspaceId });
      router.replace(`/workspace/${workspaceId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onDelete = () => {
    deleteBoard({
      boardId: id,
      workspaceId,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="transparent">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-0 pb-3 pt-3" side="bottom" align="start">
        <div className="pb-4 text-center text-sm font-medium text-foreground">
          Board actions
        </div>
        <PopoverClose asChild>
          <Button
            className="absolute right-2 top-2 h-auto w-auto p-2 text-foreground"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <Button
          variant="ghost"
          onClick={onDelete}
          disabled={isLoading}
          className="h-auto w-full justify-start rounded-none p-2 px-5 text-sm font-normal"
        >
          Delete this board
        </Button>
      </PopoverContent>
    </Popover>
  );
};
