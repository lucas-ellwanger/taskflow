import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  mysqlTableCreator,
  timestamp,
  varchar,
  mysqlEnum,
  datetime,
} from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";

export const mysqlTable = mysqlTableCreator((name) => `taskflow_${name}`);

export const profile = mysqlTable(
  "profile",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 256 }).unique().notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    imageUrl: varchar("image_url", { length: 256 }).notNull(),
    email: varchar("email", { length: 256 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (profile) => ({
    id_index: index("id_index").on(profile.id),
    user_id_index: index("user_id_index").on(profile.userId),
  }),
);

export const profileRelations = relations(profile, ({ many }) => ({
  organizations: many(organization),
  members: many(member),
}));

export const organization = mysqlTable(
  "organization",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 256 }).notNull(),
    imageUrl: varchar("image_url", { length: 256 }).notNull(),
    inviteCode: varchar("invite_code", { length: 256 }).notNull().unique(),

    profileId: varchar("profile_id", { length: 256 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (organization) => ({
    id_index: index("id_index").on(organization.id),
    profile_id_index: index("profile_id_index").on(organization.profileId),
  }),
);

export const organizationRelations = relations(
  organization,
  ({ one, many }) => ({
    members: many(member),
    boards: many(board),
    profile: one(profile, {
      fields: [organization.profileId],
      references: [profile.id],
    }),
  }),
);

export const member = mysqlTable(
  "member",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    role: mysqlEnum("role", ["ADMIN", "MODERATOR", "MEMBER"])
      .notNull()
      .$default(() => "MEMBER"),

    profileId: varchar("profile_id", { length: 256 }).notNull(),
    organizationId: varchar("organization_id", { length: 256 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (member) => ({
    profile_id_index: index("profile_id_index").on(member.profileId),
    organization_id_index: index("organization_id_index").on(
      member.organizationId,
    ),
  }),
);

export const memberRelations = relations(member, ({ one }) => ({
  profile: one(profile, {
    fields: [member.profileId],
    references: [profile.id],
  }),
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
}));

export const board = mysqlTable(
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

    organizationId: varchar("organization_id", { length: 36 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (board) => ({
    id_index: index("id_index").on(board.id),
    organization_id_index: index("organization_id_index").on(
      board.organizationId,
    ),
  }),
);

export const boardRelations = relations(board, ({ one, many }) => ({
  organization: one(organization, {
    fields: [board.organizationId],
    references: [organization.id],
  }),
  lists: many(list),
}));

export const list = mysqlTable(
  "list",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    title: varchar("title", { length: 256 }).notNull(),
    order: int("order").notNull(),

    boardId: varchar("board_id", { length: 36 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (list) => ({
    id_index: index("id_index").on(list.id),
    board_id_index: index("board_id_index").on(list.boardId),
  }),
);

export const listRelations = relations(list, ({ one, many }) => ({
  board: one(board, {
    fields: [list.boardId],
    references: [board.id],
  }),
  cards: many(card),
}));

export const card = mysqlTable(
  "card",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    title: varchar("title", { length: 256 }).notNull(),
    order: int("order").notNull(),
    description: varchar("description", { length: 256 }),

    listId: varchar("list_id", { length: 36 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (card) => ({
    id_index: index("id_index").on(card.id),
    list_id_index: index("list_id_index").on(card.listId),
  }),
);

export const cardRelations = relations(card, ({ one }) => ({
  list: one(list, {
    fields: [card.listId],
    references: [list.id],
  }),
}));

export const auditLog = mysqlTable(
  "audit_log",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    action: mysqlEnum("action", ["CREATE", "UPDATE", "DELETE"]).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    entityType: mysqlEnum("entity_type", ["BOARD", "LIST", "CARD"]).notNull(),
    entityTitle: varchar("entity_title", { length: 256 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    userImage: varchar("user_image", { length: 256 }).notNull(),
    userName: varchar("user_name", { length: 256 }).notNull(),

    organizationId: varchar("organization_id", { length: 36 }).notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (auditLog) => ({
    organization_id_index: index("organization_id_index").on(
      auditLog.organizationId,
    ),
  }),
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  organization: one(organization, {
    fields: [auditLog.organizationId],
    references: [organization.id],
  }),
}));

export const orgLimit = mysqlTable(
  "org_limit",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    count: int("limit").notNull().default(0),

    organizationId: varchar("organization_id", { length: 36 })
      .notNull()
      .unique(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (orgLimit) => ({
    id_index: index("id_index").on(orgLimit.id),
    organization_id_index: index("organization_id_index").on(
      orgLimit.organizationId,
    ),
  }),
);

export const orgLimitRelations = relations(orgLimit, ({ one }) => ({
  organization: one(organization, {
    fields: [orgLimit.organizationId],
    references: [organization.id],
  }),
}));

export const orgSubscription = mysqlTable(
  "org_subscription",
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
    stripeCurrentPeriodEnd: datetime("stripe_current_period_end"),

    organizationId: varchar("organization_id", { length: 36 })
      .notNull()
      .unique(),
  },
  (orgSubscription) => ({
    id_index: index("id_index").on(orgSubscription.id),
    organization_id_index: index("org_id_index").on(
      orgSubscription.organizationId,
    ),
  }),
);

export const orgSubscriptionRelations = relations(
  orgSubscription,
  ({ one }) => ({
    organization: one(organization, {
      fields: [orgSubscription.organizationId],
      references: [organization.id],
    }),
  }),
);

export type Profile = typeof profile.$inferSelect;
export type Organization = typeof organization.$inferSelect;
export type Member = typeof member.$inferSelect;
export type List = typeof list.$inferSelect;
export type Card = typeof card.$inferSelect;
export type AuditLog = typeof auditLog.$inferSelect;
export type OrgLimit = typeof orgLimit.$inferSelect;
export type OrgSubscription = typeof orgSubscription.$inferSelect;
