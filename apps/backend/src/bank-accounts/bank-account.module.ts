import { Module } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { BankAccountController } from './bank-account.controller';
import { DatabaseModule } from '../../drizzle/db/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [BankAccountService],
    controllers: [BankAccountController],
    exports: [BankAccountService],
})
export class BankAccountModule { }
