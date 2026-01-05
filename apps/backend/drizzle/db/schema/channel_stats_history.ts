import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core';
import { telegram_channels } from './telegram_channels';

export const channel_stats_history = pgTable('channel_stats_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    channel_id: uuid("channel_id").notNull().references(() => telegram_channels.id),
    subscribers: integer("subscribers"),
    avg_views: integer("avg_views"),
    captured_at: timestamp("captured_at").defaultNow().notNull(),
});

export const channel_stats_history_relations = relations(channel_stats_history, ({ one }) => ({
    channel: one(telegram_channels, {
        fields: [channel_stats_history.channel_id],
        references: [telegram_channels.id],
    }),
}));
