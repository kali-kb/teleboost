import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { campaign_placements } from "./campaign_placements.js";
import { dispute_status } from "./enums/dispute_status.js";
import { wallet_owner_type } from "./enums/wallet_owner_type.js";
import { users } from "./auth.js";
import { telegram_identities } from "./telegram_identities.js";
import { relations } from "drizzle-orm";

export const disputes = pgTable("disputes", {
    id: uuid("id").primaryKey().defaultRandom(),
    placement_id: uuid("placement_id").notNull().references(() => campaign_placements.id),
    raised_by_type: wallet_owner_type("raised_by_type").notNull(),
    raised_by_user_id: uuid("raised_by_user_id").references(() => users.id),
    raised_by_telegram_id: uuid("raised_by_telegram_id").references(() => telegram_identities.id),
    reason: text("reason").notNull(),
    status: dispute_status("status").notNull(),
    resolution: text("resolution"),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

export const disputes_relations = relations(disputes, ({ one }) => ({
    placement: one(campaign_placements, {
        fields: [disputes.placement_id],
        references: [campaign_placements.id],
    }),
    user: one(users, {
        fields: [disputes.raised_by_user_id],
        references: [users.id],
    }),
    telegram_identity: one(telegram_identities, {
        fields: [disputes.raised_by_telegram_id],
        references: [telegram_identities.id],
    }),
}));
