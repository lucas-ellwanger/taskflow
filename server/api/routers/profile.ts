import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { Profile, profile } from "@/server/db/schema";
import { auth, currentUser, redirectToSignIn } from "@clerk/nextjs";
import { eq } from "drizzle-orm";

export const profileRouter = createTRPCRouter({
  // create: publicProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     await ctx.db.insert(posts).values({
  //       name: input.name,
  //     });
  //   }),
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

    if (userProfile) return;

    return await db.insert(profile).values({
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0]?.emailAddress || "",
    });
  }),

  currentProfile: publicProcedure.query(async () => {
    const { userId } = auth();

    if (!userId) return null;

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.userId, userId),
    });

    if (!userProfile) return null;

    return userProfile;
  }),
});
