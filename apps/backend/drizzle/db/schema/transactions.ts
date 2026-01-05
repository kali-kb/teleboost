import { pgTable, uuid, decimal, timestamp, varchar } from 'drizzle-orm/pg-core';
import { wallets } from './wallets';
import { transaction_type } from './enums/transaction_type';
import { relations } from 'drizzle-orm';

export const transactions = pgTable('transactions', {
    id: uuid("id").primaryKey().defaultRandom(),
    wallet_id: uuid("wallet_id").notNull().references(() => wallets.id),
    type: transaction_type("type").notNull(),
    amount: decimal("amount").notNull(),
    reference_type: varchar("reference_type"),
    reference_id: uuid("reference_id"),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

export const transactions_relations = relations(transactions, ({ one }) => ({
    wallet: one(wallets, {
        fields: [transactions.wallet_id],
        references: [wallets.id],
    }),
}));
