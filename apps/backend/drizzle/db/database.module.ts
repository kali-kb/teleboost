import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';

export const DRIZZLE = 'DRIZZLE';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
          throw new Error('DATABASE_URL is not defined');
        }
        const pool = new Pool({
          connectionString,
        });

        // Sanitize schema to exclude "default" export and other non-drizzle objects
        // apt to cause crashes in Drizzle ORM
        const sanitizedSchema: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(schema)) {
          // "default" export in ESM/CommonJS interop can cause Drizzle to crash
          if (key === 'default') continue;

          // Exclude null/undefined
          if (value === null || value === undefined) {
            console.warn(
              `WARNING: Schema export "${key}" is null/undefined. Excluding from drizzle schema.`,
            );
            continue;
          }

          // Exclude TypeScript Enums (starting with Uppercase) to be safe
          // Drizzle expects pgEnum objects (starting with lowercase) or Tables
          if (/^[A-Z]/.test(key)) {
            continue;
          }

          sanitizedSchema[key] = value;
        }

        return drizzle(pool, { schema: sanitizedSchema as any });
      },
    },
  ],

  exports: [DRIZZLE],
})
export class DatabaseModule {}
