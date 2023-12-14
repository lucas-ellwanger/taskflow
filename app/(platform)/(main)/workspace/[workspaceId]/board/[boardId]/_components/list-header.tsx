"use client";

import { ElementRef, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useEventListener } from "usehooks-ts";

import { Input } from "@/components/ui/input";
import { List } from "@/server/db/schema";
import { api } from "@/trpc/react";

import { ListOptions } from "./list-options";

interface ListHeaderProps {
  list: List;
  onAddCard: () => void;
}

export const ListHeader = ({ list, onAddCard }: ListHeaderProps) => {
  const params = useParams();

  const [title, setTitle] = useState(list.title);
  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

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

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  const { mutate: updateList, isLoading } = api.list.updateTitle.useMutation({
    onSuccess: ({ data }) => {
      disableEditing();
      setTitle(data.title);
      toast.success(`List renamed to "${data.title}"`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (formData: FormData) => {
    const newTitle = formData.get("title") as string;
    const workspaceId = params.workspaceId as string;

    if (newTitle === title) {
      return disableEditing();
    }

    updateList({
      id: list.id,
      title: newTitle,
      boardId: list.boardId,
      workspaceId,
    });
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  useEventListener("keydown", onKeyDown);

  return (
    <div className="flex items-start justify-between gap-x-2 px-2 pt-2 text-sm font-semibold">
      {isEditing ? (
        <form ref={formRef} action={onSubmit} className="flex-1 px-[2px]">
          <Input
            className="h-7 truncate border-transparent bg-transparent px-[7px] py-1 text-sm font-medium transition hover:border-input focus:border-input focus:bg-background"
            ref={inputRef}
            id="title"
            name="title"
            placeholder="Enter list title..."
            defaultValue={title}
            onBlur={onBlur}
            disabled={isLoading}
          />
        </form>
      ) : (
        <div
          onClick={enableEditing}
          className="h-7 w-full border-transparent px-2.5 py-1 text-sm font-medium"
        >
          {title}
        </div>
      )}
      <ListOptions onAddCard={onAddCard} list={list} />
    </div>
  );
};
