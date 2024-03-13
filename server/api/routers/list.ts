import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { board, card, list } from "@/server/db/schema";
import { api } from "@/trpc/server";

export const listRouter = createTRPCRouter({
  getListsWithCards: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const lists = await ctx.db.query.list.findMany({
        where: and(eq(list.boardId, input.boardId)),
        with: {
          cards: {
            orderBy: (card, { asc }) => [asc(card.position)],
          },
        },
        orderBy: (list, { asc }) => [asc(list.position)],
      });

      return { lists };
    }),

  createList: publicProcedure
    .input(
      z.object({
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
        const b = await ctx.db.query.board.findFirst({
          where: and(
            eq(board.id, input.boardId),
            eq(board.workspaceId, input.workspaceId)
          ),
        });

        if (!b) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Board not found",
          });
        }

        const lastList = await ctx.db.query.list.findFirst({
          where: eq(list.boardId, input.boardId),
          orderBy: (list, { desc }) => [desc(list.position)],
          columns: {
            position: true,
          },
        });

        const newPosition = lastList ? lastList.position + 1 : 1;

        const [newList] = await ctx.db
          .insert(list)
          .values({
            title: input.title,
            boardId: input.boardId,
            position: newPosition,
          })
          .returning();

        await api.auditLog.createAuditLog.mutate({
          action: "CREATE",
          entityId: newList?.id,
          entityType: "LIST",
          entityTitle: input.title,
          userId: session.user.id,
          userImage: session.user.imageUrl,
          userName: session.user.name,
          workspaceId: input.workspaceId,
        });

        revalidatePath(
          `/workspace/${input.workspaceId}/board/${input.boardId}`
        );
        return { success: true, data: input };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create list",
        });
      }
    }),

  updateTitle: publicProcedure
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
        await ctx.db
          .update(list)
          .set({
            title: input.title,
          })
          .where(and(eq(list.id, input.id), eq(list.boardId, input.boardId)));

        await api.auditLog.createAuditLog.mutate({
          action: "UPDATE",
          entityId: input.id,
          entityType: "LIST",
          entityTitle: input.title,
          userId: session.user.id,
          userImage: session.user.imageUrl,
          userName: session.user.name,
          workspaceId: input.workspaceId,
        });

        revalidatePath(`/workspace/${input.workspaceId}/board/${input.id}`);
        return { success: true, data: input };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update board",
        });
      }
    }),

  deleteList: publicProcedure
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
        const [deletedList] = await ctx.db
          .delete(list)
          .where(and(eq(list.id, input.id), eq(list.boardId, input.boardId)))
          .returning();

        if (!deletedList) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Failed to delete list",
          });
        }

        await api.auditLog.createAuditLog.mutate({
          action: "DELETE",
          entityId: input.id,
          entityType: "LIST",
          entityTitle: deletedList.title,
          userId: session.user.id,
          userImage: session.user.imageUrl,
          userName: session.user.name,
          workspaceId: input.workspaceId,
        });

        await ctx.db.delete(card).where(eq(card.listId, input.id));

        revalidatePath(
          `/workspace/${input.workspaceId}/board/${input.boardId}`
        );
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete list",
        });
      }
    }),

  copyList: publicProcedure
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
        const listToCopy = await ctx.db.query.list.findFirst({
          where: and(eq(list.id, input.id), eq(list.boardId, input.boardId)),
          with: {
            cards: true,
          },
        });

        if (!listToCopy) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "List not found",
          });
        }

        const lastList = await ctx.db.query.list.findFirst({
          where: eq(list.boardId, input.boardId),
          orderBy: (list, { desc }) => [desc(list.position)],
          columns: {
            position: true,
          },
        });

        const newPosition = lastList ? lastList.position + 1 : 1;

        const [newList] = await ctx.db
          .insert(list)
          .values({
            boardId: listToCopy.boardId,
            title: `${listToCopy.title} - Copy`,
            position: newPosition,
          })
          .returning();

        const newListCards = listToCopy.cards.map((card) => {
          return {
            title: card.title,
            description: card.description,
            position: card.position,
            listId: newList?.id as string,
          };
        });

        if (newListCards.length > 0) {
          await ctx.db.insert(card).values(newListCards);
        }

        await api.auditLog.createAuditLog.mutate({
          action: "CREATE",
          entityId: newList?.id,
          entityType: "LIST",
          entityTitle: `${listToCopy.title} - Copy`,
          userId: session.user.id,
          userImage: session.user.imageUrl,
          userName: session.user.name,
          workspaceId: input.workspaceId,
        });

        revalidatePath(
          `/workspace/${input.workspaceId}/board/${input.boardId}`
        );
        return { success: true, data: listToCopy };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to copy list",
        });
      }
    }),

  updateListPosition: publicProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          position: z.number(),
          boardId: z.string(),
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
          async (listItem) =>
            await ctx.db
              .update(list)
              .set({
                position: listItem.position + 1,
              })
              .where(
                and(
                  eq(list.id, listItem.id),
                  eq(list.boardId, listItem.boardId)
                )
              )
        );

        revalidatePath(
          `/workspace/${input[0]?.workspaceId}/board/${input[0]?.boardId}`
        );
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update list position",
        });
      }
    }),
});
