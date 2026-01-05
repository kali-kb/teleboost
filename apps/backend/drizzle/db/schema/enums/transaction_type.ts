import { pgEnum } from "drizzle-orm/pg-core";

export const transaction_type = pgEnum("transaction_type", ["CREDIT", "DEBIT"]);
