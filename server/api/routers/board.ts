import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { board, card, list } from "@/server/db/schema";
import { api } from "@/trpc/server";

export const boardRouter = createTRPCRouter({
  createBoard: publicProcedure
    .input(
      z.object({
        title: z.string(),
        image: z.string(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = await getUserAuth();
      const { title, image, workspaceId } = input;

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const [
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageLinkHTML,
        imageUserName,
      ] = image.split("|");

      if (
        !imageId ||
        !imageThumbUrl ||
        !imageFullUrl ||
        !imageLinkHTML ||
        !imageUserName
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create board",
        });
      }

      try {
        const [newBoard] = await ctx.db
          .insert(board)
          .values({
            title,
            workspaceId,
            imageId,
            imageThumbUrl,
            imageFullUrl,
            imageUserName,
            imageLinkHTML,
          })
          .returning();

        if (!newBoard) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Failed to create board",
          });
        }

        await api.auditLog.createAuditLog.mutate({
          action: "CREATE",
          entityId: newBoard.id,
          entityType: "BOARD",
          entityTitle: title,
          userId: session.user.id,
          userImage: session.user.imageUrl,
          userName: session.user.name,
          workspaceId: workspaceId,
        });

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: true, data: newBoard };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create board",
        });
      }
    }),

  updateTitle: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
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
        await ctx.db
          .update(board)
          .set({
            title: input.title,
          })
          .where(
            and(
              eq(board.id, input.id),
              eq(board.workspaceId, input.workspaceId)
            )
          );

        await api.auditLog.createAuditLog.mutate({
          action: "UPDATE",
          entityId: input.id,
          entityType: "BOARD",
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

  deleteBoard: publicProcedure
    .input(
      z.object({
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
        const [deletedBoard] = await ctx.db
          .delete(board)
          .where(
            and(
              eq(board.id, input.boardId),
              eq(board.workspaceId, input.workspaceId)
            )
          )
          .returning();

        if (!deletedBoard) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Failed to delete board",
          });
        }

        await api.auditLog.createAuditLog.mutate({
          action: "DELETE",
          entityId: input.boardId,
          entityType: "BOARD",
          entityTitle: deletedBoard.title,
          userId: session.user.id,
          userImage: session.user.imageUrl,
          userName: session.user.name,
          workspaceId: input.workspaceId,
        });

        const listIds = await ctx.db.query.list.findMany({
          where: eq(list.boardId, input.boardId),
          columns: { id: true },
        });

        if (listIds.length > 0) {
          // Delete all cards
          await ctx.db.delete(card).where(
            inArray(
              card.listId,
              listIds.map((l) => l.id)
            )
          );

          // Delete all the lists
          await ctx.db.delete(list).where(eq(list.boardId, input.boardId));
        }

        revalidatePath(`/workspace/${input.workspaceId}`);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete board",
        });
      }
    }),

  getBoard: publicProcedure
    .input(z.object({ boardId: z.string(), workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const b = await ctx.db.query.board.findFirst({
        where: and(
          eq(board.id, input.boardId),
          eq(board.workspaceId, input.workspaceId)
        ),
      });

      return { board: b };
    }),

  getBoards: publicProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const b = await ctx.db.query.board.findMany({
        where: eq(board.workspaceId, input.workspaceId),
        orderBy: (board, { asc }) => [asc(board.createdAt)],
      });

      return b;
    }),
});
