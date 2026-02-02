import { Controller, Get, Post, Body, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('wallets')
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get('my-wallet')
    async getMyWallet(@Session() session: UserSession) {
        if (!session?.user?.id) throw new UnauthorizedException();
        const wallet = await this.walletService.getWalletByUserId(session.user.id);
        if (!wallet) {
            // In a real app, you might want to auto-create a wallet for new users
            return { error: 'Wallet not found' };
        }
        return wallet;
    }

    @Get(':id/balance')
    async getBalance(@Param('id') id: string) {
        return this.walletService.getBalance(id);
    }

    @Get(':id/transactions')
    async getTransactions(@Param('id') id: string) {
        return this.walletService.getTransactions(id);
    }
}
