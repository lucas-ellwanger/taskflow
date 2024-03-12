import { auditLogRouter } from "@/server/api/routers/audit-log";
import { boardRouter } from "@/server/api/routers/board";
import { cardRouter } from "@/server/api/routers/card";
import { listRouter } from "@/server/api/routers/list";
import { workspaceRouter } from "@/server/api/routers/workspace";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  board: boardRouter,
  list: listRouter,
  card: cardRouter,
  auditLog: auditLogRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
