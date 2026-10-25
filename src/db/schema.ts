import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  groupCode: text("group_code").notNull(),
  votingOpen: boolean("voting_open").notNull().default(false),
  revealActive: boolean("reveal_active").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const members = pgTable(
  "members",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    photoUrl: text("photo_url"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("members_name_key").on(t.name)],
);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    tagline: text("tagline"),
    kind: text("kind").notNull(),
    position: integer("position").notNull().default(0),
    autoNominees: boolean("auto_nominees").notNull().default(false),
  },
  (t) => [uniqueIndex("categories_key_key").on(t.key)],
);

export const nominees = pgTable("nominees", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  memberId: integer("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  authorName: text("author_name"),
  messageText: text("message_text"),
  messageAt: text("message_at"),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  rankPosition: integer("rank_position"),
  position: integer("position").notNull().default(0),
});

export const ballots = pgTable(
  "ballots",
  {
    id: serial("id").primaryKey(),
    voterId: integer("voter_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("ballots_voter_category_key").on(t.voterId, t.categoryId)],
);

export const ballotPicks = pgTable(
  "ballot_picks",
  {
    id: serial("id").primaryKey(),
    ballotId: integer("ballot_id")
      .notNull()
      .references(() => ballots.id, { onDelete: "cascade" }),
    nomineeId: integer("nominee_id")
      .notNull()
      .references(() => nominees.id, { onDelete: "cascade" }),
    rank: integer("rank"),
  },
  (t) => [uniqueIndex("ballot_picks_ballot_nominee_key").on(t.ballotId, t.nomineeId)],
);

export const nomineesRelations = relations(nominees, ({ one }) => ({
  member: one(members, {
    fields: [nominees.memberId],
    references: [members.id],
  }),
}));

export type Member = typeof members.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Nominee = typeof nominees.$inferSelect;
