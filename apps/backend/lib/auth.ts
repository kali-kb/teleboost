import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '../drizzle/db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import crypto from 'node:crypto';

console.log(`database url: ${process.env.DATABASE_URL}`)

export const auth = betterAuth({
  database: drizzleAdapter(
    drizzle(
      new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
      { schema },
    ),
    {
      provider: 'pg',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    },
  ),
  baseURL: 'http://localhost:3001/api/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  debug: true,
  trustedOrigins: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ] as string[],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
}) as unknown as ReturnType<typeof betterAuth>;
