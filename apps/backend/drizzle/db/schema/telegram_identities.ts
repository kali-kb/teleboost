import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { bank_accounts } from "./bank_accounts";
import { wallets } from "./wallets";

export const telegram_identities = pgTable("telegram_identity", {
    id: uuid("id").primaryKey().defaultRandom(),
    telegram_user_id: text("telegram_user_id").notNull().unique(),
    username: text("username"),
    first_name: text("first_name"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const telegram_identities_relations = relations(telegram_identities, ({ many, one }) => ({
    bank_accounts: many(bank_accounts),
    wallet: one(wallets, {
        fields: [telegram_identities.id],
        references: [wallets.owner_telegram_id],
    }),
}));
