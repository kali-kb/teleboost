import { pgTable, text, timestamp, uuid, decimal } from "drizzle-orm/pg-core";
import { campaign_placements } from "./campaign_placements.js";
import { payment_status_enum } from "./enums/payment_status.js";
import { users } from "./auth.js";
import { telegram_identities } from "./telegram_identities.js";
import { relations } from "drizzle-orm";

export const payments = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    placement_id: uuid("placement_id").notNull().references(() => campaign_placements.id),
    advertiser_user_id: uuid("advertiser_user_id").notNull().references(() => users.id),
    channel_owner_id: uuid("channel_owner_id").notNull().references(() => telegram_identities.id),
    gross_amount: decimal("gross_amount").notNull(),
    platform_fee: decimal("platform_fee").default("0.2").notNull(),
    net_amount: decimal("net_amount").notNull(),
    status: payment_status_enum("status").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

export const payments_relations = relations(payments, ({ one }) => ({
    placement: one(campaign_placements, {
        fields: [payments.placement_id],
        references: [campaign_placements.id],
    }),
    advertiser: one(users, {
        fields: [payments.advertiser_user_id],
        references: [users.id],
    }),
    channel_owner: one(telegram_identities, {
        fields: [payments.channel_owner_id],
        references: [telegram_identities.id],
    }),
}));
