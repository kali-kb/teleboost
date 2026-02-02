import { pgEnum } from "drizzle-orm/pg-core";

export const withdrawal_status_enum = pgEnum("withdrawal_status", [
    "PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"
]);

export enum WithdrawalStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}
