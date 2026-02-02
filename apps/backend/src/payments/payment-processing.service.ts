import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/db/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle/db/schema';
import { eq, sql } from 'drizzle-orm';
import { WalletService } from '../wallet/wallet.service';
import { PaymentStatus } from '../../drizzle/db/schema/enums/payment_status';
import { TransactionType } from '../../drizzle/db/schema/enums/transaction_type';

@Injectable()
export class PaymentProcessingService {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>,
        private readonly walletService: WalletService,
    ) { }

    async completePayment(paymentId: string) {
        return await this.db.transaction(async (tx) => {
            const payment = await tx.query.payments.findFirst({
                where: eq(schema.payments.id, paymentId),
            });

            if (!payment || payment.status !== PaymentStatus.PENDING) {
                throw new BadRequestException('Payment not found or already processed');
            }

            // 1. Resolve wallets
            const advertiserWallet = await this.walletService.getWalletByUserId(payment.advertiser_user_id);
            const channelOwnerWallet = await this.walletService.getWalletByTelegramId(payment.channel_owner_id);

            if (!advertiserWallet || !channelOwnerWallet) {
                throw new BadRequestException('One or more wallets not found');
            }

            // 2. Mark payment as COMPLETED
            await tx
                .update(schema.payments)
                .set({ status: PaymentStatus.COMPLETED })
                .where(eq(schema.payments.id, paymentId));

            // 3. DEBIT advertiser (already locked funds should be unlocked/deducted)
            // For now, simple debit/credit
            await tx
                .update(schema.wallets)
                .set({
                    balance: sql`${schema.wallets.balance} - ${payment.gross_amount}`,
                })
                .where(eq(schema.wallets.id, advertiserWallet.id));

            await tx.insert(schema.transactions).values({
                wallet_id: advertiserWallet.id,
                type: TransactionType.DEBIT,
                amount: payment.gross_amount,
                reference_type: 'PAYMENT',
                reference_id: paymentId,
            });

            // 4. CREDIT channel owner
            await tx
                .update(schema.wallets)
                .set({
                    balance: sql`${schema.wallets.balance} + ${payment.net_amount}`,
                })
                .where(eq(schema.wallets.id, channelOwnerWallet.id));

            await tx.insert(schema.transactions).values({
                wallet_id: channelOwnerWallet.id,
                type: TransactionType.CREDIT,
                amount: payment.net_amount,
                reference_type: 'PAYMENT',
                reference_id: paymentId,
            });

            return payment;
        });
    }
}

