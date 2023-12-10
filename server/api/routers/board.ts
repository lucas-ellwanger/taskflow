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
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = await getUserAuth();
      const { title, organizationId } = input;

      try {
        // const newBoard = await ctx.db.insert(board).values({
        //   title,
        //   userId: session?.user.id!,
        //   organizationId: input.organizationId!,
        // });

        return { data: input };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create board",
        });
      }
    }),
});
