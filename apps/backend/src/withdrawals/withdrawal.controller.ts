import { Controller, Post, Body, Get, Param, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { WalletService } from '../wallet/wallet.service';

@Controller('withdrawals')
export class WithdrawalController {
    constructor(
        private readonly withdrawalService: WithdrawalService,
        private readonly walletService: WalletService,
    ) { }

    @Post()
    async requestWithdrawal(@Session() session: UserSession, @Body() data: { amount: number; bankAccountId: string }) {
        if (!session?.user?.id) throw new UnauthorizedException();
        
        // Find wallet for the user (assuming advertiser/user has a wallet)
        // Actually, withdrawals are for channel owners.
        // A user might have a linked telegram identity.
        
        const wallet = await this.walletService.getWalletByUserId(session.user.id);
        if (!wallet) throw new BadRequestException('Wallet not found');
        
        return this.withdrawalService.requestWithdrawal(wallet.id, data.bankAccountId, data.amount);
    }

    @Get('history')
    async getHistory(@Session() session: UserSession) {
        if (!session?.user?.id) throw new UnauthorizedException();
        const wallet = await this.walletService.getWalletByUserId(session.user.id);
        if (!wallet) throw new BadRequestException('Wallet not found');
        
        return this.withdrawalService.getWithdrawalHistory(wallet.id);
    }
}
