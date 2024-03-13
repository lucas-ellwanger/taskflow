import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { auditLog } from "@/server/db/schema";

export const auditLogRouter = createTRPCRouter({
  createAuditLog: publicProcedure
    .input(
      z.object({
        action: z.enum(["CREATE", "UPDATE", "DELETE"]),
        entityId: z.string().optional(),
        entityType: z.enum(["BOARD", "LIST", "CARD"]),
        entityTitle: z.string(),
        userId: z.string(),
        userImage: z.string().optional(),
        userName: z.string().optional(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.insert(auditLog).values({
          action: input.action,
          entityId: input.entityId ?? "",
          entityType: input.entityType,
          entityTitle: input.entityTitle,
          userId: input.userId,
          userImage: input.userImage ?? "",
          userName: input.userName ?? "",
          workspaceId: input.workspaceId,
        });
      } catch (error) {
        console.log("[AUDIT_LOG_ERROR]", error);
      }
    }),

  getLatestAuditLogs: publicProcedure
    .input(
      z.object({
        workspaceId: z.string().or(z.undefined()),
        entityId: z.string().or(z.undefined()),
        entityType: z.enum(["BOARD", "LIST", "CARD"]),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.entityId || !input.workspaceId) {
        return null;
      }

      try {
        const auditLogs = await ctx.db.query.auditLog.findMany({
          where: and(
            eq(auditLog.workspaceId, input.workspaceId),
            eq(auditLog.entityId, input.entityId),
            eq(auditLog.entityType, input.entityType)
          ),
          orderBy: (auditLog, { desc }) => [desc(auditLog.createdAt)],
          limit: 3,
        });

        return auditLogs;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch logs",
        });
      }
    }),
});
