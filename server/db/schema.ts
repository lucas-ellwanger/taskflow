// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  index,
  mysqlTableCreator,
  timestamp,
  varchar,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";

export const mysqlTable = mysqlTableCreator((name) => `taskflow_${name}`);

export const profile = mysqlTable(
  "profile",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 256 }).unique(),
    name: varchar("name", { length: 256 }),
    imageUrl: varchar("image_url", { length: 256 }),
    email: varchar("email", { length: 256 }),

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
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 256 }),
    imageUrl: varchar("image_url", { length: 256 }),
    inviteCode: varchar("invite_code", { length: 256 }),

    profileId: varchar("profile_id", { length: 256 }).references(
      () => profile.id,
      { onDelete: "cascade" },
    ),

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
      .$defaultFn(() => createId()),
    role: mysqlEnum("role", ["ADMIN", "MODERATOR", "MEMBER"]).$default(
      () => "MEMBER",
    ),

    profileId: varchar("profile_id", { length: 256 }).references(
      () => profile.id,
      { onDelete: "cascade" },
    ),
    organizationId: varchar("organization_id", { length: 256 }).references(
      () => organization.id,
      { onDelete: "cascade" },
    ),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (member) => ({
    id_index: index("id_index").on(member.id),
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
