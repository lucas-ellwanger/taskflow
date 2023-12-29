import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { card, list } from "@/server/db/schema";

export const cardRouter = createTRPCRouter({
  createCard: publicProcedure
    .input(
      z.object({
        title: z.string(),
        listId: z.string(),
        boardId: z.string(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = await getUserAuth();

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      try {
        const l = await ctx.db.query.list.findFirst({
          where: and(
            eq(list.id, input.listId),
            eq(list.boardId, input.boardId)
          ),
        });

        if (!l) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "List not found",
          });
        }

        const lastCard = await ctx.db.query.card.findFirst({
          where: eq(card.listId, input.listId),
          orderBy: (card, { desc }) => [desc(card.position)],
          columns: {
            position: true,
          },
        });

        const newPosition = lastCard ? lastCard.position + 1 : 1;

        await ctx.db.insert(card).values({
          title: input.title,
          listId: input.listId,
          position: newPosition,
        });

        revalidatePath(`/workspace/${input.boardId}/board/${input.boardId}`);
        return { success: true, data: input };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create card",
        });
      }
    }),
});
