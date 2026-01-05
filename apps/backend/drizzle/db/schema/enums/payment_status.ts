import { pgEnum } from "drizzle-orm/pg-core";

export const payment_status_enum = pgEnum("payment_status", ["PENDING", "HELD", "RELEASED", "REFUNDED", "FAILED"]);
export enum PaymentStatus {
    PENDING = 'PENDING',
    HELD = 'HELD',
    RELEASED = 'RELEASED',
    REFUNDED = 'REFUNDED',
    FAILED = 'FAILED',
}
