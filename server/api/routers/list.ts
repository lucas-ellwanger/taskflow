import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { board, list } from "@/server/db/schema";

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

        const newOrder = lastList ? lastList.position + 1 : 1;

        await ctx.db.insert(list).values({
          title: input.title,
          boardId: input.boardId,
          position: newOrder,
        });

        revalidatePath(`/workspace/${input.boardId}/board/${input.boardId}`);
        return { success: true, data: input };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create list",
        });
      }
    }),

  // updateBoard: publicProcedure
  //   .input(updateBoardParams)
  //   .mutation(async ({ ctx, input }) => {
  //     const { session } = await getUserAuth();

  //     if (!session) {
  //       throw new TRPCError({
  //         code: "UNAUTHORIZED",
  //         message: "Unauthorized",
  //       });
  //     }

  //     try {
  //       await ctx.db
  //         .update(board)
  //         .set(input)
  //         .where(
  //           and(
  //             eq(board.id, input.id),
  //             eq(board.workspaceId, input.workspaceId)
  //           )
  //         );

  //       revalidatePath(`/workspace/${input.workspaceId}/board/${input.id}`);
  //       return { success: true, data: input };
  //     } catch (error) {
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Failed to update board",
  //       });
  //     }
  //   }),

  // deleteBoard: publicProcedure
  //   .input(
  //     z.object({
  //       boardId: z.string(),
  //       workspaceId: z.string(),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { session } = await getUserAuth();

  //     if (!session) {
  //       throw new TRPCError({
  //         code: "UNAUTHORIZED",
  //         message: "Unauthorized",
  //       });
  //     }

  //     try {
  //       await ctx.db
  //         .delete(board)
  //         .where(
  //           and(
  //             eq(board.id, input.boardId),
  //             eq(board.workspaceId, input.workspaceId)
  //           )
  //         );

  //       revalidatePath(`/workspace/${input.workspaceId}`);
  //       return { success: true };
  //     } catch (error) {
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Failed to delete board",
  //       });
  //     }
  //   }),
});
