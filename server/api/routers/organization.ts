import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { member, organization } from "@/server/db/schema";

export const organizationRouter = createTRPCRouter({
  findFistByUserId: publicProcedure.query(async ({ ctx }) => {
    const { session } = await getUserAuth();

    const t = await ctx.db.query.organization.findFirst({
      where: eq(organization.userId, session?.user.id!),
    });

    return { organization: t };
  }),

  create: publicProcedure
    .input(z.object({ name: z.string(), imageUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session } = await getUserAuth();
      const { name, imageUrl } = input;

      try {
        await ctx.db.insert(organization).values({
          name,
          imageUrl,
          userId: session?.user.id!,
          inviteCode: createId(),
        });

        const org = await ctx.db.query.organization.findFirst({
          where: eq(organization.userId, session?.user.id!),
          orderBy: (organization, { desc }) => [desc(organization.createdAt)],
        });

        if (!org) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }

        await ctx.db.insert(member).values({
          userId: session?.user.id!,
          role: "ADMIN",
          organizationId: org.id,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new organization",
        });
      }
    }),

  findMember: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = await getUserAuth();
      const { organizationId } = input;

      const t = await ctx.db.query.member.findFirst({
        where: and(
          eq(member.organizationId, organizationId),
          eq(member.userId, session?.user.id!)
        ),
      });

      return { member: t };
    }),

  getUserMemberships: publicProcedure.query(async ({ ctx }) => {
    const { session } = await getUserAuth();

    const organizations = await ctx.db.query.member.findMany({
      where: eq(member.userId, session?.user.id!),
      columns: {
        organizationId: true,
      },
    });

    const organizationIds: string[] = organizations.map(
      (org) => org.organizationId
    );

    const userMemberships = await ctx.db.query.organization.findMany({
      where: inArray(organization.id, organizationIds),
    });

    return userMemberships;
  }),
});
