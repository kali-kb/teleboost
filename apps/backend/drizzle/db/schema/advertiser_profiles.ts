import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { advertiser_type_enum } from './enums/advertiser_types';

export const advertiser_profiles = pgTable('advertiser_profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id),
  type: advertiser_type_enum('type').notNull(),
  company_name: text('company_name'),
  company_registration_number: text('company_registration_number'),
  // tin_number: text("tin_number"),
  // role: text("role"),
  website: text('website'),
  verified: boolean('verified').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const advertiser_profiles_relations = relations(
  advertiser_profiles,
  ({ one }) => ({
    user: one(users, {
      fields: [advertiser_profiles.user_id],
      references: [users.id],
    }),
  }),
);
