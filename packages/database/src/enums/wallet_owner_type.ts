import { pgEnum } from "drizzle-orm/pg-core";

export const wallet_owner_type = pgEnum("wallet_owner_type", ["ADVERTISER", "CHANNEL_OWNER"]);
