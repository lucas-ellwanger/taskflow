import { z } from "zod";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { member } from "@/server/db/schema";

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

      if (org) {
        return redirect(`/organization/${org.id}`);
      }

      return { success: true };
    }),
});
