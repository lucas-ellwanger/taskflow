"use client";

import { ElementRef, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Board, updateBoardSchema } from "@/server/db/schema";
import { api } from "@/trpc/react";

interface BoardTitleFormProps {
  board: Board;
}

export const BoardTitleForm = ({ board }: BoardTitleFormProps) => {
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(board.title);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const { mutate: updateBoard, isLoading } = api.board.updateBoard.useMutation({
    onSuccess: ({ data }) => {
      disableEditing();
      setTitle(data.title);
      toast.success(`Board "${data.title}" updated!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (formData: FormData) => {
    const newTitle = formData.get("title") as string;

    const newBoard = updateBoardSchema.parse({
      ...board,
      title: newTitle,
    });

    updateBoard({
      ...newBoard,
    });
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  if (isEditing) {
    return (
      <form
        action={onSubmit}
        ref={formRef}
        className="flex items-center gap-x-2"
      >
        <Input
          ref={inputRef}
          id="title"
          name="title"
          onBlur={onBlur}
          defaultValue={title}
          className="h-7 border-none bg-transparent px-[7px] py-1 text-lg font-bold focus-visible:outline-none focus-visible:ring-transparent"
        />
      </form>
    );
  }

  return (
    <Button
      onClick={enableEditing}
      disabled={isLoading}
      variant="transparent"
      className="h-auto w-auto p-1 px-2 text-lg font-bold"
    >
      {title}
    </Button>
  );
};
