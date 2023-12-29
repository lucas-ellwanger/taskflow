"use client";

import { useRef, type ElementRef } from "react";
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
import { Separator } from "@/components/ui/separator";
import { type List } from "@/server/db/schema";
import { api } from "@/trpc/react";

interface ListOptionsProps {
  data: List;
  onAddCard: () => void;
}

export const ListOptions = ({ data, onAddCard }: ListOptionsProps) => {
  const params = useParams();
  const router = useRouter();
  const closeRef = useRef<ElementRef<"button">>(null);

  const { mutate: copyList, isLoading: isCopying } =
    api.list.copyList.useMutation({
      onSuccess: ({ data }) => {
        closeRef.current?.click();
        router.refresh();
        toast.success(`List "${data.title} - (copy)" copied`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const onCopy = () => {
    const boardId = params.boardId as string;
    const workspaceId = params.workspaceId as string;

    copyList({
      id: data.id,
      boardId,
      workspaceId,
    });
  };

  const { mutate: deleteList, isLoading: isDeleting } =
    api.list.deleteList.useMutation({
      onSuccess: () => {
        closeRef.current?.click();
        router.refresh();
        toast.success(`List "${data.title}" deleted`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const onDelete = () => {
    const boardId = params.boardId as string;
    const workspaceId = params.workspaceId as string;

    deleteList({
      id: data.id,
      boardId,
      workspaceId,
    });
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-0 pb-3 pt-3" side="bottom" align="start">
        <div className="pb-4 text-center text-sm font-medium text-foreground">
          List actions
        </div>
        <PopoverClose ref={closeRef} asChild>
          <Button
            className="absolute right-2 top-2 h-auto w-auto p-2 text-foreground/80"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <Button
          onClick={onAddCard}
          className="h-auto w-full justify-start rounded-none p-2 px-5 text-sm font-normal"
          variant="ghost"
        >
          Add card...
        </Button>
        <Button
          onClick={onCopy}
          disabled={isCopying}
          className="h-auto w-full justify-start rounded-none p-2 px-5 text-sm font-normal"
          variant="ghost"
        >
          Copy list...
        </Button>
        <Separator />
        <Button
          onClick={onDelete}
          disabled={isDeleting}
          className="h-auto w-full justify-start rounded-none p-2 px-5 text-sm font-normal"
          variant="ghost"
        >
          Delete this list
        </Button>
      </PopoverContent>
    </Popover>
  );
};
