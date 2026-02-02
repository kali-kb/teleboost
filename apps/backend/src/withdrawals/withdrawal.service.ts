import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/db/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle/db/schema';
import { eq, and } from 'drizzle-orm';
import { WalletService } from '../wallet/wallet.service';
import { WithdrawalStatus } from '../../drizzle/db/schema/enums/withdrawal_status';
import { TransactionType } from '../../drizzle/db/schema/enums/transaction_type';

@Injectable()
export class WithdrawalService {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>,
        private readonly walletService: WalletService,
    ) { }

    async requestWithdrawal(walletId: string, bankAccountId: string, amount: number) {
        return await this.db.transaction(async (tx) => {
            // 1. Validate balance
            const wallet = await tx.query.wallets.findFirst({
                where: eq(schema.wallets.id, walletId),
            });

            if (!wallet) throw new BadRequestException('Wallet not found');
            const available = parseFloat(wallet.balance) - parseFloat(wallet.locked_balance);
            if (available < amount) {
                throw new BadRequestException('Insufficient available funds');
            }

            // 2. Lock funds
            await tx
                .update(schema.wallets)
                .set({
                    locked_balance: (parseFloat(wallet.locked_balance || '0') + amount).toString(),
                })
                .where(eq(schema.wallets.id, walletId));

            // 3. Create withdrawal record
            const [withdrawal] = await tx
                .insert(schema.withdrawals)
                .values({
                    wallet_id: walletId,
                    bank_account_id: bankAccountId,
                    amount: amount.toString(),
                    net_amount: amount.toString(), // Simplified for now, could subtract fees
                    status: WithdrawalStatus.PENDING,
                })
                .returning();

            return withdrawal;
        });
    }

    async processWithdrawal(id: string) {
        return this.db
            .update(schema.withdrawals)
            .set({ status: WithdrawalStatus.PROCESSING })
            .where(eq(schema.withdrawals.id, id))
            .returning();
    }

    async completeWithdrawal(id: string, referenceCode: string) {
        return await this.db.transaction(async (tx) => {
            const withdrawal = await tx.query.withdrawals.findFirst({
                where: eq(schema.withdrawals.id, id),
            });

            if (!withdrawal || withdrawal.status !== WithdrawalStatus.PROCESSING) {
                throw new BadRequestException('Withdrawal not in processable state');
            }

            // 1. Mark as completed
            await tx
                .update(schema.withdrawals)
                .set({
                    status: WithdrawalStatus.COMPLETED,
                    reference_code: referenceCode,
                    processed_at: new Date(),
                })
                .where(eq(schema.withdrawals.id, id));

            // 2. Deduct from wallet (and unlock)
            const wallet = await tx.query.wallets.findFirst({
                where: eq(schema.wallets.id, withdrawal.wallet_id),
            });

            if (!wallet) throw new BadRequestException('Wallet not found');

            await tx
                .update(schema.wallets)
                .set({
                    balance: (parseFloat(wallet.balance) - parseFloat(withdrawal.amount)).toString(),
                    locked_balance: (parseFloat(wallet.locked_balance) - parseFloat(withdrawal.amount)).toString(),
                })
                .where(eq(schema.wallets.id, withdrawal.wallet_id));

            // 3. Add transaction record
            await tx.insert(schema.transactions).values({
                wallet_id: withdrawal.wallet_id,
                type: TransactionType.DEBIT,
                amount: withdrawal.amount,
                reference_type: 'WITHDRAWAL',
                reference_id: id,
            });

            return withdrawal;
        });
    }

    async failWithdrawal(id: string, reason: string) {
        return await this.db.transaction(async (tx) => {
            const withdrawal = await tx.query.withdrawals.findFirst({
                where: eq(schema.withdrawals.id, id),
            });

            if (!withdrawal || withdrawal.status === WithdrawalStatus.COMPLETED) {
                throw new BadRequestException('Withdrawal cannot be failed');
            }

            // 1. Mark as failed and unlock funds
            await tx
                .update(schema.withdrawals)
                .set({
                    status: WithdrawalStatus.FAILED,
                    failure_reason: reason,
                })
                .where(eq(schema.withdrawals.id, id));

            const wallet = await tx.query.wallets.findFirst({
                where: eq(schema.wallets.id, withdrawal.wallet_id),
            });

            if (!wallet) throw new BadRequestException('Wallet not found');

            await tx
                .update(schema.wallets)
                .set({
                    locked_balance: (parseFloat(wallet.locked_balance) - parseFloat(withdrawal.amount)).toString(),
                })
                .where(eq(schema.wallets.id, withdrawal.wallet_id));

            return withdrawal;
        });
    }

    async getWithdrawalHistory(walletId: string) {
        return this.db.query.withdrawals.findMany({
            where: eq(schema.withdrawals.wallet_id, walletId),
            orderBy: (withdrawals, { desc }) => [desc(withdrawals.created_at)],
        });
    }
}
