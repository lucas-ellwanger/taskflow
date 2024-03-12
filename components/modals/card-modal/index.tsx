"use client";

import { useParams } from "next/navigation";

import { useCardModal } from "@/hooks/use-card-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { api } from "@/trpc/react";

import { Actions } from "./actions";
import { Activity } from "./activity";
import { Description } from "./description";
import { Header } from "./header";

export const CardModal = () => {
  const params = useParams();

  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);

  const { data: cardData, isLoading } = api.card.getCard.useQuery({
    cardId: id,
  });

  const { data: auditLogsData, isLoading: isLoadingLogs } =
    api.auditLog.getLatestAuditLogs.useQuery({
      workspaceId: params.workspaceId as string,
      entityId: id,
      entityType: "CARD",
    });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {isLoading || !cardData ? (
          <Header.Skeleton />
        ) : (
          <Header data={cardData} />
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            <div className="w-full space-y-6">
              {isLoading || !cardData ? (
                <Description.Skeleton />
              ) : (
                <Description data={cardData} />
              )}
              {isLoadingLogs || !auditLogsData ? (
                <Activity.Skeleton />
              ) : (
                <Activity items={auditLogsData} />
              )}
            </div>
          </div>
          {isLoading || !cardData ? (
            <Actions.Skeleton />
          ) : (
            <Actions data={cardData} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
