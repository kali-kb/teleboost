import { Controller, Get, Post, Body, Param, Delete, Put, UnauthorizedException } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('bank-accounts')
export class BankAccountController {
    constructor(private readonly bankAccountService: BankAccountService) { }

    // This endpoint should ideally resolve the telegram identity from the user session
    // For now, it might need to be passed or resolved via another service
    @Post()
    async create(@Body() createDto: any) {
        // channel_owner_id should be validated
        return this.bankAccountService.createBankAccount(createDto.channel_owner_id, createDto);
    }

    @Get('by-owner/:ownerId')
    async findAll(@Param('ownerId') ownerId: string) {
        return this.bankAccountService.getBankAccounts(ownerId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Body('channel_owner_id') ownerId: string) {
        return this.bankAccountService.deleteBankAccount(id, ownerId);
    }

    @Put(':id/set-default')
    async setDefault(@Param('id') id: string, @Body('channel_owner_id') ownerId: string) {
        return this.bankAccountService.setDefault(id, ownerId);
    }
}
