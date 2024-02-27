import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `taskflow_${name}`);

export const workspace = createTable(
  "workspace",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 256 }).notNull(),
    imageUrl: varchar("image_url", { length: 256 }).notNull(),
    inviteCode: varchar("invite_code", { length: 256 }).notNull().unique(),

    userId: varchar("user_id", { length: 36 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (workspace) => ({
    idIndex: index("id_workspace_index").on(workspace.id),
    userIdIndex: index("user_id_workspace_index").on(workspace.userId),
  })
);

export const workspaceRelations = relations(workspace, ({ many }) => ({
  members: many(member),
  boards: many(board),
}));

export const member = createTable(
  "member",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    role: varchar("role", { enum: ["ADMIN", "MODERATOR", "MEMBER"] })
      .notNull()
      .$default(() => "MEMBER"),

    userId: varchar("user_id", { length: 36 }).notNull(),
    workspaceId: varchar("workspace_id", { length: 256 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (member) => ({
    userIdIndex: index("user_id_member_index").on(member.userId),
    workspaceIdIndex: index("workspace_id_member_index").on(member.workspaceId),
  })
);

export const memberRelations = relations(member, ({ one }) => ({
  workspace: one(workspace, {
    fields: [member.workspaceId],
    references: [workspace.id],
  }),
}));

export const board = createTable(
  "board",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    title: varchar("title", { length: 256 }).notNull(),
    imageId: varchar("image_id", { length: 256 }).notNull(),
    imageThumbUrl: varchar("image_thumb_url", { length: 256 }).notNull(),
    imageFullUrl: varchar("image_full_url", { length: 256 }).notNull(),
    imageUserName: varchar("image_user_name", { length: 256 }).notNull(),
    imageLinkHTML: varchar("image_link_html", { length: 256 }).notNull(),

    workspaceId: varchar("workspace_id", { length: 36 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (board) => ({
    workspaceIdIndex: index("workspace_id_board_index").on(board.workspaceId),
  })
);

export const boardRelations = relations(board, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [board.workspaceId],
    references: [workspace.id],
  }),
  lists: many(list),
}));

export const list = createTable(
  "list",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    title: varchar("title", { length: 256 }).notNull(),
    position: integer("position").notNull(),

    boardId: varchar("board_id", { length: 36 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (list) => ({
    boardIdIndex: index("board_id_list_index").on(list.boardId),
  })
);

export const listRelations = relations(list, ({ one, many }) => ({
  board: one(board, {
    fields: [list.boardId],
    references: [board.id],
  }),
  cards: many(card),
}));

export const card = createTable(
  "card",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    title: varchar("title", { length: 256 }).notNull(),
    position: integer("position").notNull(),
    description: varchar("description", { length: 256 }),

    listId: varchar("list_id", { length: 36 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (card) => ({
    listIdIndex: index("list_id_card_index").on(card.listId),
  })
);

export const cardRelations = relations(card, ({ one }) => ({
  list: one(list, {
    fields: [card.listId],
    references: [list.id],
  }),
}));

export const auditLog = createTable(
  "audit_log",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    action: varchar("action", {
      enum: ["CREATE", "UPDATE", "DELETE"],
    }).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    entityType: varchar("entity_type", {
      enum: ["BOARD", "LIST", "CARD"],
    }).notNull(),
    entityTitle: varchar("entity_title", { length: 256 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    userImage: varchar("user_image", { length: 256 }).notNull(),
    userName: varchar("user_name", { length: 256 }).notNull(),

    workspaceId: varchar("workspace_id", { length: 36 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (auditLog) => ({
    workspaceIdIndex: index("workspace_id_audit_index").on(
      auditLog.workspaceId
    ),
  })
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  workspace: one(workspace, {
    fields: [auditLog.workspaceId],
    references: [workspace.id],
  }),
}));

export const workspaceLimit = createTable(
  "workspace_limit",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    count: integer("limit").notNull().default(0),

    workspaceId: varchar("workspace_id", { length: 36 }).notNull().unique(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (workspaceLimit) => ({
    workspaceIdIndex: index("workspace_id_limit_index").on(
      workspaceLimit.workspaceId
    ),
  })
);

export const workspaceLimitRelations = relations(workspaceLimit, ({ one }) => ({
  workspace: one(workspace, {
    fields: [workspaceLimit.workspaceId],
    references: [workspace.id],
  }),
}));

export const workspaceSubscription = createTable(
  "workspace_subscription",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    stripeCustomerId: varchar("stripe_customer_id", { length: 36 }).unique(),
    stripeSubscriptionId: varchar("stripe_subscription_id", {
      length: 36,
    }).unique(),
    stripePriceId: varchar("stripe_price_id", { length: 36 }),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),

    workspaceId: varchar("workspace_id", { length: 36 }).notNull().unique(),
  },
  (workspaceSubscription) => ({
    workspaceIdIndex: index("workspace_id_sub_index").on(
      workspaceSubscription.workspaceId
    ),
  })
);

export const workspaceSubscriptionRelations = relations(
  workspaceSubscription,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspaceSubscription.workspaceId],
      references: [workspace.id],
    }),
  })
);

export type Workspace = typeof workspace.$inferSelect;

export type Board = typeof board.$inferSelect;

export type Member = typeof member.$inferSelect;

export type List = typeof list.$inferSelect;

export type Card = typeof card.$inferSelect;

export type AuditLog = typeof auditLog.$inferSelect;

export type WorkspaceLimit = typeof workspaceLimit.$inferSelect;

export type WorkspaceSubscription = typeof workspaceSubscription.$inferSelect;
