import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { campaign_placements } from './campaign_placements';

export const campaign_posts = pgTable('campaign_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  placement_id: uuid('placement_id')
    .notNull()
    .references(() => campaign_placements.id),
  telegram_message_id: text('telegram_message_id'),
  post_url: text('post_url'),
  views_after_24h: integer('views_after_24h'),
  views_after_48h: integer('views_after_48h'),
  posted_at: timestamp('posted_at'),
});

export const campaign_posts_relations = relations(
  campaign_posts,
  ({ one }) => ({
    placement: one(campaign_placements, {
      fields: [campaign_posts.placement_id],
      references: [campaign_placements.id],
    }),
  }),
);
