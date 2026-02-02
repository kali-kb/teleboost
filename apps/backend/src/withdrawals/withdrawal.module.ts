import { Module } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { DatabaseModule } from '../../drizzle/db/database.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [DatabaseModule, WalletModule],
    providers: [WithdrawalService],
    controllers: [WithdrawalController],
    exports: [WithdrawalService],
})
export class WithdrawalModule { }
