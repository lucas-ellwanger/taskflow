import { redirect } from "next/navigation";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
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
        with: {
          members: {
            where: eq(member.profileId, profileId),
          },
        },
      });

      if (!org) return null;

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
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
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
});
