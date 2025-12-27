import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth.js";
import { relations } from "drizzle-orm";

export const admin_logs = pgTable("admin_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    admin_user_id: uuid("admin_user_id").notNull().references(() => users.id),
    action: varchar("action").notNull(),
    target_type: varchar("target_type"),
    target_id: uuid("target_id"),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

export const admin_logs_relations = relations(admin_logs, ({ one }) => ({
    admin: one(users, {
        fields: [admin_logs.admin_user_id],
        references: [users.id],
    }),
}));
