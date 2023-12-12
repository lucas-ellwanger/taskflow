"use client";

import { ListWithCards } from "@/lib/types";

import { ListForm } from "./list-form";

interface ListContainerProps {
  boardId: string;
  lists: ListWithCards[];
}

export const ListContainer = ({ boardId, lists }: ListContainerProps) => {
  return (
    <ol>
      <ListForm />
      <div className="flex w-1 shrink-0" />
    </ol>
  );
};
