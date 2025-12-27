import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@teleboost/database";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const auth = betterAuth({
    database: drizzleAdapter(drizzle(new Pool({
        connectionString: process.env.DATABASE_URL
    }), { schema }), {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
        }
    }),
    emailAndPassword: {
        enabled: true
    }
});
