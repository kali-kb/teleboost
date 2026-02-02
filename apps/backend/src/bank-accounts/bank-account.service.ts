import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/db/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle/db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class BankAccountService {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async createBankAccount(channelOwnerId: string, data: any) {
        return await this.db.transaction(async (tx) => {
            if (data.is_default) {
                // Remove default from others
                await tx
                    .update(schema.bank_accounts)
                    .set({ is_default: false })
                    .where(eq(schema.bank_accounts.channel_owner_id, channelOwnerId));
            }

            const [result] = await tx
                .insert(schema.bank_accounts)
                .values({
                    ...data,
                    channel_owner_id: channelOwnerId,
                })
                .returning();
            return result;
        });
    }

    async getBankAccounts(channelOwnerId: string) {
        return this.db.query.bank_accounts.findMany({
            where: eq(schema.bank_accounts.channel_owner_id, channelOwnerId),
        });
    }

    async deleteBankAccount(id: string, channelOwnerId: string) {
        return this.db
            .delete(schema.bank_accounts)
            .where(
                and(
                    eq(schema.bank_accounts.id, id),
                    eq(schema.bank_accounts.channel_owner_id, channelOwnerId),
                ),
            )
            .returning();
    }

    async setDefault(id: string, channelOwnerId: string) {
        return await this.db.transaction(async (tx) => {
            await tx
                .update(schema.bank_accounts)
                .set({ is_default: false })
                .where(eq(schema.bank_accounts.channel_owner_id, channelOwnerId));

            const [result] = await tx
                .update(schema.bank_accounts)
                .set({ is_default: true })
                .where(
                    and(
                        eq(schema.bank_accounts.id, id),
                        eq(schema.bank_accounts.channel_owner_id, channelOwnerId),
                    ),
                )
                .returning();
            return result;
        });
    }
}
