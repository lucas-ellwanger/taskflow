"use client";

import { useCardModal } from "@/hooks/use-card-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { api } from "@/trpc/react";

import { Header } from "./header";

export const CardModal = () => {
  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);

  const { data: card, isLoading } = api.card.getCard.useQuery({
    cardId: id,
  });

  if (!card) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {isLoading ? <Header.Skeleton /> : <Header data={card} />}
      </DialogContent>
    </Dialog>
  );
};
