import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { board } from "@/server/db/schema";

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
        await ctx.db.insert(board).values({
          title,
          workspaceId,
          imageId,
          imageThumbUrl,
          imageFullUrl,
          imageUserName,
          imageLinkHTML,
        });

        const createdBoard = await ctx.db.query.board.findFirst({
          where: eq(board.workspaceId, workspaceId),
          orderBy: (board, { desc }) => [desc(board.createdAt)],
        });

        if (!createdBoard) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Failed to create board",
          });
        }

        return { createdBoard };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create board",
        });
      }
    }),
});
