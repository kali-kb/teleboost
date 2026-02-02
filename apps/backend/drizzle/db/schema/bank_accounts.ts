import { pgTable, text, timestamp, uuid, boolean, varchar } from 'drizzle-orm/pg-core';
import { telegram_identities } from './telegram_identities';
import { relations } from 'drizzle-orm';

export const bank_accounts = pgTable('bank_accounts', {
    id: uuid('id').primaryKey().defaultRandom(),
    channel_owner_id: uuid('channel_owner_id')
        .notNull()
        .references(() => telegram_identities.id),
    account_holder_name: varchar('account_holder_name', { length: 255 }).notNull(),
    bank_name: varchar('bank_name', { length: 255 }).notNull(),
    account_number: varchar('account_number', { length: 50 }).notNull(),
    is_default: boolean('is_default').default(false).notNull(),
    is_verified: boolean('is_verified').default(false).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const bank_accounts_relations = relations(bank_accounts, ({ one }) => ({
    channel_owner: one(telegram_identities, {
        fields: [bank_accounts.channel_owner_id],
        references: [telegram_identities.id],
    }),
}));
