import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { campaign_status_enum } from './enums/campaign_status';
import { relations } from 'drizzle-orm';
import { campaign_placements } from './campaign_placements';

export const campaigns = pgTable('campaign', {
  id: uuid('id').primaryKey().defaultRandom(),
  advertiser_id: uuid('advertiser_id')
    .notNull()
    .references(() => users.id),
  marketing_copy: text('marketing_copy').notNull(),
  metadata: jsonb('metadata'),
  status: campaign_status_enum('status').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const campaigns_relations = relations(campaigns, ({ many }) => ({
  placements: many(campaign_placements),
}));
