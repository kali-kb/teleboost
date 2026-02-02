import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/db/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle/db/schema';
import { eq, sql } from 'drizzle-orm';
import { TransactionType } from '../../drizzle/db/schema/enums/transaction_type';

@Injectable()
export class WalletService {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async getWalletByUserId(userId: string) {
        return this.db.query.wallets.findFirst({
            where: eq(schema.wallets.owner_user_id, userId),
        });
    }

    async getWalletByTelegramId(telegramId: string) {
        return this.db.query.wallets.findFirst({
            where: eq(schema.wallets.owner_telegram_id, telegramId),
        });
    }

    async createAdvertiserWallet(userId: string) {
        const existing = await this.getWalletByUserId(userId);
        if (existing) return existing;

        const [wallet] = await this.db
            .insert(schema.wallets)
            .values({
                owner_type: 'ADVERTISER',
                owner_user_id: userId,
            })
            .returning();
        return wallet;
    }

    async createChannelOwnerWallet(telegramId: string) {
        const existing = await this.getWalletByTelegramId(telegramId);
        if (existing) return existing;

        const [wallet] = await this.db
            .insert(schema.wallets)
            .values({
                owner_type: 'CHANNEL_OWNER',
                owner_telegram_id: telegramId,
            })
            .returning();
        return wallet;
    }

    async getBalance(walletId: string) {
        const wallet = await this.db.query.wallets.findFirst({
            where: eq(schema.wallets.id, walletId),
        });
        if (!wallet) throw new BadRequestException('Wallet not found');
        return {
            balance: parseFloat(wallet.balance),
            locked_balance: parseFloat(wallet.locked_balance),
            available_balance: parseFloat(wallet.balance) - parseFloat(wallet.locked_balance),
        };
    }

    async addFunds(walletId: string, amount: number, referenceType?: string, referenceId?: string) {
        return await this.db.transaction(async (tx) => {
            const [updatedWallet] = await tx
                .update(schema.wallets)
                .set({
                    balance: sql`${schema.wallets.balance} + ${amount.toString()}`,
                })
                .where(eq(schema.wallets.id, walletId))
                .returning();

            await tx.insert(schema.transactions).values({
                wallet_id: walletId,
                type: TransactionType.CREDIT,
                amount: amount.toString(),
                reference_type: referenceType,
                reference_id: referenceId,
            });

            return updatedWallet;
        });
    }

    async deductFunds(walletId: string, amount: number, referenceType?: string, referenceId?: string) {
        return await this.db.transaction(async (tx) => {
            const wallet = await tx.query.wallets.findFirst({
                where: eq(schema.wallets.id, walletId),
            });

            if (!wallet || parseFloat(wallet.balance) < amount) {
                throw new BadRequestException('Insufficient funds');
            }

            const [updatedWallet] = await tx
                .update(schema.wallets)
                .set({
                    balance: sql`${schema.wallets.balance} - ${amount.toString()}`,
                })
                .where(eq(schema.wallets.id, walletId))
                .returning();

            await tx.insert(schema.transactions).values({
                wallet_id: walletId,
                type: TransactionType.DEBIT,
                amount: amount.toString(),
                reference_type: referenceType,
                reference_id: referenceId,
            });

            return updatedWallet;
        });
    }

    async lockFunds(walletId: string, amount: number) {
        const wallet = await this.getBalance(walletId);
        if (wallet.available_balance < amount) {
            throw new BadRequestException('Insufficient available funds');
        }

        return this.db
            .update(schema.wallets)
            .set({
                locked_balance: sql`${schema.wallets.locked_balance} + ${amount.toString()}`,
            })
            .where(eq(schema.wallets.id, walletId))
            .returning();
    }

    async unlockFunds(walletId: string, amount: number) {
        return this.db
            .update(schema.wallets)
            .set({
                locked_balance: sql`${schema.wallets.locked_balance} - ${amount.toString()}`,
            })
            .where(eq(schema.wallets.id, walletId))
            .returning();
    }

    async getTransactions(walletId: string) {
        return this.db.query.transactions.findMany({
            where: eq(schema.transactions.wallet_id, walletId),
            orderBy: (transactions, { desc }) => [desc(transactions.created_at)],
            limit: 50,
        });
    }
}
