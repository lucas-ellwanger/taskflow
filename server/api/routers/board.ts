import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { board } from "@/server/db/schema";

export const boardRouter = createTRPCRouter({
  createBoard: publicProcedure
    .input(
      z.object({
        title: z
          .string({ required_error: "Title is required" })
          .min(2, "Title is required"),
        organizationId: z.string({
          required_error: "Organization is required",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = await getUserAuth();
      const { title, organizationId } = input;

      try {
        // const newBoard = await ctx.db.insert(board).values({
        //   title,
        //   userId: session?.user.id!,
        //   organizationId: input.organizationId,
        // });
        return { success: true };
      } catch (error) {
        const message = (error as Error).message ?? "Failed to create board";
        console.error(message);
        return { error: message };
      }
    }),
});
