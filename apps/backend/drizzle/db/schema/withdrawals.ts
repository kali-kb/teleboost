import { pgTable, text, timestamp, uuid, decimal, varchar } from 'drizzle-orm/pg-core';
import { wallets } from './wallets';
import { bank_accounts } from './bank_accounts';
import { withdrawal_status_enum } from './enums/withdrawal_status';
import { relations } from 'drizzle-orm';

export const withdrawals = pgTable('withdrawals', {
    id: uuid('id').primaryKey().defaultRandom(),
    wallet_id: uuid('wallet_id')
        .notNull()
        .references(() => wallets.id),
    bank_account_id: uuid('bank_account_id')
        .notNull()
        .references(() => bank_accounts.id),
    amount: decimal('amount', { precision: 20, scale: 2 }).notNull(),
    fee: decimal('fee', { precision: 20, scale: 2 }).default('0').notNull(),
    net_amount: decimal('net_amount', { precision: 20, scale: 2 }).notNull(),
    status: withdrawal_status_enum('status').default('PENDING').notNull(),
    reference_code: varchar('reference_code', { length: 100 }).unique(),
    processed_at: timestamp('processed_at'),
    failure_reason: text('failure_reason'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const withdrawals_relations = relations(withdrawals, ({ one }) => ({
    wallet: one(wallets, {
        fields: [withdrawals.wallet_id],
        references: [wallets.id],
    }),
    bank_account: one(bank_accounts, {
        fields: [withdrawals.bank_account_id],
        references: [bank_accounts.id],
    }),
}));
