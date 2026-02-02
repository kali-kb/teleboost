import { Module } from '@nestjs/common';
import { PaymentProcessingService } from './payment-processing.service';
import { DatabaseModule } from '../../drizzle/db/database.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [DatabaseModule, WalletModule],
    providers: [PaymentProcessingService],
    exports: [PaymentProcessingService],
})
export class PaymentsModule { }
