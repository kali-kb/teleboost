import { pgEnum } from "drizzle-orm/pg-core";

export const dispute_status = pgEnum("dispute_status", ["OPEN", "RESOLVED", "REJECTED"]);
