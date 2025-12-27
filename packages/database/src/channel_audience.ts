import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { telegram_channels } from "./telegram_channels.js";

export const channel_audience = pgTable("channel_audience", {
    id: uuid("id").primaryKey().defaultRandom(),
    channel_id: uuid("channel_id").notNull().references(() => telegram_channels.id),
    primary_country: text("primary_country"),
    primary_city: text("primary_city"),
    language: text("language"),
    niche: text("niche"),
    is_local: boolean("is_local"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const channel_audience_relations = relations(channel_audience, ({ one }) => ({
    channel: one(telegram_channels, {
        fields: [channel_audience.channel_id],
        references: [telegram_channels.id],
    }),
}));
