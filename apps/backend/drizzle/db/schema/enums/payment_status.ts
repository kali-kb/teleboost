import { pgEnum } from "drizzle-orm/pg-core";

export const payment_status_enum = pgEnum("payment_status", ["PENDING", "HELD", "RELEASED", "COMPLETED", "REFUNDED", "FAILED"]);
export enum PaymentStatus {
    PENDING = 'PENDING',
    HELD = 'HELD',
    RELEASED = 'RELEASED',
    COMPLETED = 'COMPLETED',
    REFUNDED = 'REFUNDED',
    FAILED = 'FAILED',
}
