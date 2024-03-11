"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";

import { useCardModal } from "@/hooks/use-card-modal";
import type { Card } from "@/server/db/schema";

interface CardItemProps {
  data: Card;
  index: number;
}

export const CardItem = ({ data, index }: CardItemProps) => {
  const cardModal = useCardModal();

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          role="button"
          onClick={() => cardModal.onOpen(data.id)}
          className="mt-2 truncate rounded-md border-2 border-transparent bg-background px-3 py-2 text-sm shadow-sm hover:border-foreground"
        >
          {data.title}
        </div>
      )}
    </Draggable>
  );
};
