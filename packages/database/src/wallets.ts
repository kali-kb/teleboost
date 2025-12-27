import { pgTable, text, timestamp, uuid, decimal, varchar } from "drizzle-orm/pg-core";
import { wallet_owner_type } from "./enums/wallet_owner_type.js";
import { users } from "./auth.js";
import { telegram_identities } from "./telegram_identities.js";
import { relations } from "drizzle-orm";

export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  owner_type: wallet_owner_type("owner_type").notNull(),
  owner_user_id: uuid("owner_user_id").references(() => users.id),
  owner_telegram_id: uuid("owner_telegram_id").references(() => telegram_identities.id),
  balance: decimal("balance").default("0").notNull(),
  locked_balance: decimal("locked_balance").default("0").notNull(),
  currency: varchar("currency").default("ETB").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const wallets_relations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.owner_user_id],
    references: [users.id],
  }),
  telegram_identity: one(telegram_identities, {
    fields: [wallets.owner_telegram_id],
    references: [telegram_identities.id],
  }),
}));
