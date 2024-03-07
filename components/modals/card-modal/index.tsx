"use client";

import { useCardModal } from "@/hooks/use-card-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { api } from "@/trpc/react";

import { Description } from "./description";
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
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            <div className="w-full space-y-6">
              {isLoading ? (
                <Description.Skeleton />
              ) : (
                <Description data={card} />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
