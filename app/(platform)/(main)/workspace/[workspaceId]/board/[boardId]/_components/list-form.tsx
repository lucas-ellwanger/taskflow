"use client";

import { ElementRef, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

import { ListWrapper } from "./list-wrapper";

export const ListForm = () => {
  const params = useParams();
  const router = useRouter();
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const [isEditing, setIsEditing] = useState(false);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
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

  const { mutate: createList, isLoading } = api.list.createList.useMutation({
    onSuccess: ({ data }) => {
      disableEditing();
      router.refresh();
      toast.success(`List "${data.title}" created`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const boardId = params.boardId as string;
    const workspaceId = params.workspaceId as string;

    createList({
      title,
      boardId,
      workspaceId,
    });
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);

  if (isEditing) {
    return (
      <ListWrapper>
        <form
          ref={formRef}
          action={onSubmit}
          className="w-full space-y-4 rounded-md bg-background p-3 shadow-md"
        >
          <Input
            ref={inputRef}
            id="title"
            name="title"
            className="h-7 border-transparent px-2 py-1 text-sm font-medium transition hover:border-input focus:border-input"
            placeholder="Enter list title..."
          />
          <div className="flex items-center gap-x-1">
            <Button type="submit" variant="primary" size="sm">
              Add list
            </Button>
            <Button
              type="reset"
              onClick={disableEditing}
              size="sm"
              variant="ghost"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </ListWrapper>
    );
  }

  return (
    <ListWrapper>
      <button
        onClick={enableEditing}
        className="flex w-full items-center rounded-md bg-white/80 p-3 text-sm font-medium transition hover:bg-white/60"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add a list
      </button>
    </ListWrapper>
  );
};
