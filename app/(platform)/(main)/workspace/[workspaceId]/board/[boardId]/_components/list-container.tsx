"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { toast } from "sonner";

import { type ListWithCards } from "@/lib/types";
import { api } from "@/trpc/react";

import { ListForm } from "./list-form";
import { ListItem } from "./list-item";

interface ListContainerProps {
  boardId: string;
  workspaceId: string;
  data: ListWithCards[];
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  if (removed !== undefined) result.splice(endIndex, 0, removed);

  return result;
}

export const ListContainer = ({
  boardId,
  workspaceId,
  data,
}: ListContainerProps) => {
  const [orderedData, setOrderedData] = useState(data);

  const { mutate: updateListPosition } =
    api.list.updateListPosition.useMutation({
      onSuccess: () => {
        toast.success("List reordered");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: updateCardPosition } =
    api.card.updateCardPosition.useMutation({
      onSuccess: () => {
        toast.success("Card reordered");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    // if dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // if user moves a list
    if (type === "list") {
      const items = reorder(orderedData, source.index, destination.index).map(
        (item, index) => ({
          ...item,
          position: index,
        })
      );

      setOrderedData(items);

      const listsToUpdate = items.map((list) => {
        return {
          id: list.id,
          position: list.position,
          boardId: boardId,
          workspaceId: workspaceId,
        };
      });

      updateListPosition(listsToUpdate);
    }

    // if user moves a card
    if (type === "card") {
      let newOrderedData = [...orderedData];

      // get source and destination list
      const sourceList = newOrderedData.find(
        (list) => list.id === source.droppableId
      );
      const destList = newOrderedData.find(
        (list) => list.id === destination.droppableId
      );

      if (!sourceList || !destList) {
        return;
      }

      // if cards exists in source list
      if (!sourceList.cards) {
        sourceList.cards = [];
      }

      // if cards exists in destination list
      if (!destList.cards) {
        destList.cards = [];
      }

      // if user moves a card in the same list
      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index
        );

        reorderedCards.forEach((card, idx) => {
          card.position = idx;
        });

        sourceList.cards = reorderedCards;

        setOrderedData(newOrderedData);

        const cardsToUpdate = reorderedCards.map((card) => {
          return {
            id: card.id,
            position: card.position,
            boardId: boardId,
            listId: card.listId,
            workspaceId: workspaceId,
          };
        });

        updateCardPosition(cardsToUpdate);
        // if user moves a card to another list
      } else {
        // remove card from the source list
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        if (!movedCard) {
          return;
        }

        // assign the new listId to the moved card
        movedCard.listId = destination.droppableId;
        // add card to the destination list
        destList.cards.splice(destination.index, 0, movedCard);

        sourceList.cards.forEach((card, idx) => {
          card.position = idx;
        });

        // update the order for each card in the destination list
        destList.cards.forEach((card, idx) => {
          card.position = idx;
        });

        setOrderedData(newOrderedData);

        const cardsToUpdate = destList.cards.map((card) => {
          return {
            id: card.id,
            position: card.position,
            boardId: boardId,
            listId: card.listId,
            workspaceId: workspaceId,
          };
        });

        updateCardPosition(cardsToUpdate);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex h-full"
          >
            {orderedData.map((list, index) => (
              <ListItem key={list.id} index={index} data={list} />
            ))}
            {provided.placeholder}
            <ListForm />
            <div className="w-1 flex-shrink-0" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
