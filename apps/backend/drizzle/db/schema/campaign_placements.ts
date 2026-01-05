import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, decimal } from 'drizzle-orm/pg-core';
import { campaigns } from './campaigns';
import { telegram_channels } from './telegram_channels';
import { campaign_placement_status_enum } from './enums/campaign_placement_status';

export const campaign_placements = pgTable('campaign_placements', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaign_id: uuid('campaign_id')
    .notNull()
    .references(() => campaigns.id),
  channel_id: uuid('channel_id')
    .notNull()
    .references(() => telegram_channels.id),
  scheduled_at: timestamp('scheduled_at'),
  price: decimal('price').notNull(),
  status: campaign_placement_status_enum('status').notNull(),
  rejection_reason: text('rejection_reason'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const campaign_placements_relations = relations(
  campaign_placements,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [campaign_placements.campaign_id],
      references: [campaigns.id],
    }),
    channel: one(telegram_channels, {
      fields: [campaign_placements.channel_id],
      references: [telegram_channels.id],
    }),
  }),
);
