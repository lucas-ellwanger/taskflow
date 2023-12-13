"use client";

import { ListWithCards } from "@/lib/types";

import { ListHeader } from "./list-header";

interface ListItemProps {
  index: number;
  list: ListWithCards;
}

export const ListItem = ({ index, list }: ListItemProps) => {
  return (
    <li className="h-full w-[272px] shrink-0 select-none">
      <div className="w-full rounded-md bg-[#f1f2f4] pb-2 shadow-md">
        <ListHeader list={list} />
      </div>
    </li>
  );
};
