import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { relations } from "drizzle-orm";

export const admin_profiles = pgTable("admin_profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    is_root: boolean("is_root").default(false).notNull(),
    created_by: uuid("created_by").references(() => users.id),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

export const admin_profiles_relations = relations(admin_profiles, ({ one }) => ({
    user: one(users, {
        fields: [admin_profiles.user_id],
        references: [users.id],
    }),
    creator: one(users, {
        fields: [admin_profiles.created_by],
        references: [users.id],
    }),
}));
