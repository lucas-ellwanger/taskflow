import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { member, workspace } from "@/server/db/schema";

export const workspaceRouter = createTRPCRouter({
  findFistByUserId: publicProcedure.query(async ({ ctx }) => {
    const { session } = await getUserAuth();

    const w = await ctx.db.query.workspace.findFirst({
      where: eq(workspace.userId, session?.user.id!),
    });

    return { workspace: w };
  }),

  create: publicProcedure
    .input(z.object({ name: z.string(), imageUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session } = await getUserAuth();
      const { name, imageUrl } = input;

      try {
        await ctx.db.insert(workspace).values({
          name,
          imageUrl,
          userId: session?.user.id!,
          inviteCode: createId(),
        });

        const w = await ctx.db.query.workspace.findFirst({
          where: eq(workspace.userId, session?.user.id!),
          orderBy: (workspace, { desc }) => [desc(workspace.createdAt)],
        });

        if (!w) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }

        await ctx.db.insert(member).values({
          userId: session?.user.id!,
          role: "ADMIN",
          workspaceId: w.id,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new workspace",
        });
      }
    }),

  findMember: publicProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = await getUserAuth();
      const { workspaceId } = input;

      const m = await ctx.db.query.member.findFirst({
        where: and(
          eq(member.workspaceId, workspaceId),
          eq(member.userId, session?.user.id!)
        ),
      });

      return { member: m };
    }),

  getUserMemberships: publicProcedure.query(async ({ ctx }) => {
    const { session } = await getUserAuth();

    const workspaces = await ctx.db.query.member.findMany({
      where: eq(member.userId, session?.user.id!),
      columns: {
        workspaceId: true,
      },
    });

    const workspaceIds: string[] = workspaces.map((org) => org.workspaceId);

    const userMemberships = await ctx.db.query.workspace.findMany({
      where: inArray(workspace.id, workspaceIds),
    });

    return userMemberships;
  }),

  getWorkspaceById: publicProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { workspaceId } = input;

      const w = await ctx.db.query.workspace.findFirst({
        where: eq(workspace.id, workspaceId),
      });

      return { workspace: w };
    }),

  getName: publicProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const w = await ctx.db.query.workspace.findFirst({
        where: eq(workspace.id, input.workspaceId),
        columns: {
          name: true,
        },
      });

      return { name: w?.name.toLocaleLowerCase() };
    }),
});
