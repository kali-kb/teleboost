import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';
import { telegram_identities } from './telegram_identities';

export const telegram_channels = pgTable('telegram_channel', {
  id: uuid('id').primaryKey().defaultRandom(),
  owner_id: uuid('owner_id')
    .notNull()
    .references(() => telegram_identities.id),
  telegram_channel_id: text('telegram_channel_id').notNull().unique(),
  username: text('username'),
  title: text('title'),
  category: text('category'),
  subscribers: integer('subscribers'),
  avg_views: integer('avg_views'),
  price_per_post: decimal('price_per_post'),
  verified: boolean('verified'),
  verification_method: text('verification_method'),
  trust_score: integer('trust_score'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

import { channel_audience } from './channel_audience';

export const telegram_channels_relations = relations(
  telegram_channels,
  ({ one, many }) => ({
    owner: one(telegram_identities, {
      fields: [telegram_channels.owner_id],
      references: [telegram_identities.id],
    }),
    audience: many(channel_audience),
  }),
);
