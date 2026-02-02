import { Injectable } from '@nestjs/common';
import { CreateTelegramIdentityDto } from './dto/create-telegram-identity.dto';
import { UpdateTelegramIdentityDto } from './dto/update-telegram-identity.dto';
import { Inject } from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/db/database.module';
import { telegram_identities } from '../../drizzle/db/schema';
import { eq } from 'drizzle-orm';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class TelegramIdentitiesService {
  constructor(
    @Inject(DRIZZLE) private readonly drizzle,
    private readonly walletService: WalletService,
  ) { }

  async create(createTelegramIdentityDto: CreateTelegramIdentityDto) {
    const existing = await this.drizzle
      .select()
      .from(telegram_identities)
      .where(
        eq(
          telegram_identities.telegram_user_id,
          createTelegramIdentityDto.telegramId,
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [newIdentity] = await this.drizzle
      .insert(telegram_identities)
      .values({
        telegram_user_id: createTelegramIdentityDto.telegramId,
        username: createTelegramIdentityDto.userName,
        first_name: createTelegramIdentityDto.firstName,
      })
      .returning();

    // Create wallet for new channel owner
    if (newIdentity?.id) {
      await this.walletService.createChannelOwnerWallet(newIdentity.id);
    }

    return newIdentity;
  }

  async findAll() {
    return this.drizzle.select().from(telegram_identities);
  }

  async findOne(id: string) {
    return this.drizzle
      .select()
      .from(telegram_identities)
      .where(eq(telegram_identities.id, id));
  }

  async update(
    id: string,
    updateTelegramIdentityDto: UpdateTelegramIdentityDto,
  ) {
    return this.drizzle
      .update(telegram_identities)
      .set(updateTelegramIdentityDto)
      .where(eq(telegram_identities.id, id));
  }

  async remove(id: string) {
    return this.drizzle
      .delete(telegram_identities)
      .where(eq(telegram_identities.id, id));
  }
}
