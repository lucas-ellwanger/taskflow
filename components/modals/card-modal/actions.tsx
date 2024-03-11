"use client";

import { useParams, useRouter } from "next/navigation";
import { Copy, Trash } from "lucide-react";
import { toast } from "sonner";

import { CardWithList } from "@/lib/types";
import { useCardModal } from "@/hooks/use-card-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

interface ActionsProps {
  data: CardWithList;
}

export const Actions = ({ data }: ActionsProps) => {
  const params = useParams();
  const router = useRouter();
  const cardModal = useCardModal();

  const { mutate: copyCard, isLoading: isCopying } =
    api.card.copyCard.useMutation({
      onSuccess: ({ data }) => {
        router.refresh();
        toast.success(`Card "${data.title}" copied!`);
        cardModal.onClose();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: deleteCard, isLoading: isDeleting } =
    api.card.deleteCard.useMutation({
      onSuccess: ({ data }) => {
        router.refresh();
        toast.success(`Card "${data.title}" deleted!`);
        cardModal.onClose();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const onCopy = () => {
    const boardId = params.boardId as string;
    const workspaceId = params.workspaceId as string;

    copyCard({
      id: data.id,
      boardId,
      workspaceId,
    });
  };

  const onDelete = () => {
    const boardId = params.boardId as string;
    const workspaceId = params.workspaceId as string;

    deleteCard({
      id: data.id,
      title: data.title,
      boardId,
      workspaceId,
    });
  };

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs font-semibold">Actions</p>
      <div className="space-y-2 md:space-y-[0.9rem]">
        <Button
          onClick={onCopy}
          disabled={isCopying}
          variant="gray"
          size="inline"
          className="w-full justify-start"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
        <Button
          onClick={onDelete}
          disabled={isDeleting}
          variant="gray"
          size="inline"
          className="w-full justify-start"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
};

Actions.Skeleton = function ActionsSkeleton() {
  return (
    <div className="mt-2 space-y-2">
      <Skeleton className="h-4 w-20 bg-neutral-200" />
      <Skeleton className="h-8 w-full bg-neutral-200" />
      <Skeleton className="h-8 w-full bg-neutral-200" />
    </div>
  );
};
