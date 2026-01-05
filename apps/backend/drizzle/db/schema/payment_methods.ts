import { pgTable, uuid, varchar, boolean } from "drizzle-orm/pg-core";

export const payment_methods = pgTable("payment_methods", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(), // RECEIPT | CHAPA
    enabled: boolean("enabled").default(false).notNull(),
});
