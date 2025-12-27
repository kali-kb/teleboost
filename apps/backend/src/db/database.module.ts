import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@teleboost/database';

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
                return drizzle(pool, { schema });
            },
        },
    ],

    exports: [DRIZZLE],
})
export class DatabaseModule { }
