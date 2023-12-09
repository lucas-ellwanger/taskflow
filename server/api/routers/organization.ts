import { redirect } from "next/navigation";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { member, organization } from "@/server/db/schema";
import { api } from "@/trpc/server";

export const organizationRouter = createTRPCRouter({
  findFistByProfileId: publicProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ input }) => {
      const { profileId } = input;

      const org = await db.query.organization.findFirst({
        where: eq(organization.profileId, profileId),
      });

      return org;
    }),

  create: publicProcedure
    .input(z.object({ name: z.string(), imageUrl: z.string() }))
    .mutation(async ({ input }) => {
      const { name, imageUrl } = input;

      const profile = await api.profile.currentProfile.query();

      if (!profile) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        await db.insert(organization).values({
          name,
          imageUrl,
          profileId: profile.id,
          inviteCode: createId(),
        });

        const org = await db.query.organization.findFirst({
          where: eq(organization.profileId, profile.id),
        });

        if (!org) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }

        await db.insert(member).values({
          profileId: profile.id,
          role: "ADMIN",
          organizationId: org.id,
        });
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  findMember: publicProcedure
    .input(z.object({ organizationId: z.string(), profileId: z.string() }))
    .query(async ({ input }) => {
      const { organizationId, profileId } = input;

      const orgMember = await db.query.member.findFirst({
        where: and(
          eq(member.organizationId, organizationId),
          eq(member.profileId, profileId)
        ),
      });

      return orgMember;
    }),
});
