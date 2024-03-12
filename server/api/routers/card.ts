import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { card, list } from "@/server/db/schema";
import { api } from "@/trpc/server";

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

        const newCard = await ctx.db
          .insert(card)
          .values({
            title: input.title,
            listId: input.listId,
            position: newPosition,
          })
          .returning();

        await api.auditLog.createAuditLog.mutate({
          action: "CREATE",
          entityId: newCard[0]?.id,
          entityType: "CARD",
          entityTitle: input.title,
          userId: session.user.id,
          userImage: session.user.imageUrl,
          userName: session.user.name,
          workspaceId: input.workspaceId,
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

  updateCardPosition: publicProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          position: z.number(),
          boardId: z.string(),
          listId: z.string(),
          workspaceId: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = await getUserAuth();

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      // TODO: check if user is member of workspace and have permission

      try {
        input.map(
          async (cardItem) =>
            await ctx.db
              .update(card)
              .set({
                position: cardItem.position + 1,
                listId: cardItem.listId,
              })
              .where(eq(card.id, cardItem.id))
        );

        revalidatePath(
          `/workspace/${input[0]?.workspaceId}/board/${input[0]?.boardId}`
        );
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update card position",
        });
      }
    }),

  getCard: publicProcedure
    .input(z.object({ cardId: z.string().or(z.undefined()) }))
    .query(async ({ ctx, input }) => {
      if (!input.cardId) {
        return null;
      }

      const { session } = await getUserAuth();

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      // TODO: check if user is member of workspace and have permission

      try {
        const c = await ctx.db.query.card.findFirst({
          where: eq(card.id, input.cardId),
          with: {
            list: true,
          },
        });

        return c;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get card",
        });
      }
    }),

  updateTitle: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        workspaceId: z.string(),
        boardId: z.string(),
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
        await ctx.db
          .update(card)
          .set({
            title: input.title,
          })
          .where(eq(card.id, input.id));

        revalidatePath(
          `/workspace/${input.workspaceId}/board/${input.boardId}`
        );
        return { success: true, data: input };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update board",
        });
      }
    }),

  updateDescription: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        workspaceId: z.string(),
        boardId: z.string(),
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
        await ctx.db
          .update(card)
          .set({
            description: input.description,
          })
          .where(eq(card.id, input.id));

        revalidatePath(
          `/workspace/${input.workspaceId}/board/${input.boardId}`
        );
        return { success: true, data: input };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update board",
        });
      }
    }),

  copyCard: publicProcedure
    .input(
      z.object({
        id: z.string(),
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

      // TODO: check if user is member of workspace and have permission

      try {
        const cardToCopy = await ctx.db.query.card.findFirst({
          where: eq(card.id, input.id),
        });

        if (!cardToCopy) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Card not found",
          });
        }

        const lastCard = await ctx.db.query.card.findFirst({
          where: eq(card.listId, cardToCopy.listId),
          orderBy: (card, { desc }) => [desc(card.position)],
          columns: {
            position: true,
          },
        });

        const newPosition = lastCard ? lastCard.position + 1 : 1;

        await ctx.db.insert(card).values({
          title: `${cardToCopy.title} - Copy`,
          description: cardToCopy.description,
          position: newPosition,
          listId: cardToCopy.listId,
        });

        revalidatePath(
          `/workspace/${input.workspaceId}/board/${input.boardId}`
        );
        return { success: true, data: cardToCopy };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to copy card",
        });
      }
    }),

  deleteCard: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
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

      // TODO: check if user is member of workspace and have permission

      try {
        await ctx.db.delete(card).where(eq(card.id, input.id));

        revalidatePath(
          `/workspace/${input.workspaceId}/board/${input.boardId}`
        );
        return { success: true, data: input };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete card",
        });
      }
    }),
});
