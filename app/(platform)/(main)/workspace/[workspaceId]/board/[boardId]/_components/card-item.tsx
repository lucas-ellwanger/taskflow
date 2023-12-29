"use client";

import type { Card } from "@/server/db/schema";

interface CardItemProps {
  data: Card;
  index: number;
}

export const CardItem = ({ data, index }: CardItemProps) => {
  return (
    <div
      role="button"
      className="truncate rounded-md border-2 border-transparent bg-background px-3 py-2 text-sm shadow-sm hover:border-foreground"
    >
      {data.title}
    </div>
  );
};
