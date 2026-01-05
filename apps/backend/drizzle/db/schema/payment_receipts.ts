import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { payments } from './payments';
import { relations } from 'drizzle-orm';

export const payment_receipts = pgTable('payment_receipts', {
    id: uuid('id').primaryKey().defaultRandom(),
    payment_id: uuid("payment_id").notNull().references(() => payments.id),
    receipt_reference: varchar("receipt_reference"),
    provider: varchar("provider"),
    verified: boolean("verified").default(false).notNull(),
    verified_at: timestamp("verified_at"),
});

export const payment_receipts_relations = relations(payment_receipts, ({ one }) => ({
    payment: one(payments, {
        fields: [payment_receipts.payment_id],
        references: [payments.id],
    }),
}));
