import { pgEnum } from "drizzle-orm/pg-core";

export const user_role = pgEnum("user_role", ["ADMIN", "ADVERTISER"]);
export type UserRole = "ADMIN" | "ADVERTISER";
