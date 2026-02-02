import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  varchar,
  check,
} from 'drizzle-orm/pg-core';
import { wallet_owner_type } from './enums/wallet_owner_type';
import { users } from './auth';
import { telegram_identities } from './telegram_identities';
import { relations, sql } from 'drizzle-orm';
import { bank_accounts } from './bank_accounts';
import { withdrawals } from './withdrawals';

export const wallets = pgTable(
  'wallets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    owner_type: wallet_owner_type('owner_type').notNull(),
    owner_user_id: uuid('owner_user_id').references(() => users.id),
    owner_telegram_id: uuid('owner_telegram_id').references(
      () => telegram_identities.id,
    ),
    balance: decimal('balance').default('0').notNull(),
    locked_balance: decimal('locked_balance').default('0').notNull(),
    currency: varchar('currency').default('ETB').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    owner_check: check(
      'owner_check',
      sql`(CASE 
        WHEN ${table.owner_type} = 'ADVERTISER' THEN ${table.owner_user_id} IS NOT NULL AND ${table.owner_telegram_id} IS NULL
        WHEN ${table.owner_type} = 'CHANNEL_OWNER' THEN ${table.owner_telegram_id} IS NOT NULL AND ${table.owner_user_id} IS NULL
      END)`,
    ),
  }),
);
export const wallets_relations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.owner_user_id],
    references: [users.id],
  }),
  telegram_identity: one(telegram_identities, {
    fields: [wallets.owner_telegram_id],
    references: [telegram_identities.id],
  }),
  withdrawals: many(withdrawals),
}));
