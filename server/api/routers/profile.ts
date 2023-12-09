import { auth, currentUser, redirectToSignIn } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { profile } from "@/server/db/schema";

export const profileRouter = createTRPCRouter({
  // getLatest: publicProcedure.query(({ ctx }) => {
  //   return ctx.db.query.posts.findFirst({
  //     orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  //   });
  // }),

  initialProfile: publicProcedure.mutation(async () => {
    const user = await currentUser();

    if (!user) {
      return redirectToSignIn();
    }

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.userId, user.id),
    });

    if (!userProfile) {
      await db.insert(profile).values({
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress || "",
      });
    }
  }),

  currentProfile: publicProcedure.query(async () => {
    const { userId } = auth();

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.userId, userId),
    });

    if (!userProfile) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return userProfile;
  }),
});
