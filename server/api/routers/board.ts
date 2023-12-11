import { TRPCError } from "@trpc/server";
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
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = await getUserAuth();
      const { title, image, organizationId } = input;

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
        const newBoard = await ctx.db.insert(board).values({
          title,
          organizationId,
          imageId,
          imageThumbUrl,
          imageFullUrl,
          imageUserName,
          imageLinkHTML,
        });

        return { data: input, id: newBoard.insertId };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create board",
        });
      }
    }),
});
