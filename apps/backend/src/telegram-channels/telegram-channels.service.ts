import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/db/database.module';
import * as schema from '../../drizzle/db/schema';
import { eq } from 'drizzle-orm';
import { CreateTelegramChannelsDto } from './dto/create-telegram-channels.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TelegramChannelsService {
  constructor(@Inject(DRIZZLE) private readonly drizzle) { }

  async getAllTelegramChannels() {
    const channels = await this.drizzle.query.telegram_channels.findMany({
      with: {
        audience: true
      }
    });
    return channels;
  }

  async getTelegramChannelById(id: string) {
    const channels = await this.drizzle
      .select()
      .from(schema.telegram_channels)
      .where(eq(schema.telegram_channels.id, id));

    if (channels.length === 0) {
      throw new NotFoundException(`Telegram channel with ID ${id} not found`);
    }
    return channels[0];
  }

  async createTelegramChannel(channel: CreateTelegramChannelsDto) {
    const newChannel = await this.drizzle
      .insert(schema.telegram_channels)
      .values({
        id: randomUUID(),
        owner_id: channel.ownerId,
        telegram_channel_id: channel.channelId,
        username: channel.channelUsername,
        title: channel.channelName,
        category: channel.category,
        subscribers: channel.subscribers,
        avg_views: channel.avgViews,
        price_per_post: channel.pricePerPost.toString(),
        verified: channel.verified ?? false,
        verification_method: channel.verificationMethod,
        trust_score: channel.trustScore,
        avatar_url: channel.avatarUrl,
      })
      .returning();

    const createdChannel = newChannel[0];

    if (channel.audience && this.hasAudienceData(channel.audience)) {
      const audienceData: any = {};
      if (channel.audience.primaryCountry !== undefined)
        audienceData.primary_country = channel.audience.primaryCountry;
      if (channel.audience.primaryCity !== undefined)
        audienceData.primary_city = channel.audience.primaryCity;
      if (channel.audience.language !== undefined)
        audienceData.language = channel.audience.language;
      if (channel.audience.niche !== undefined)
        audienceData.niche = channel.audience.niche;
      if (channel.audience.isLocal !== undefined)
        audienceData.is_local = channel.audience.isLocal;

      await this.drizzle.insert(schema.channel_audience).values({
        id: randomUUID(),
        channel_id: createdChannel.id,
        ...audienceData,
      });
    }

    return createdChannel;
  }

  private hasAudienceData(audience: any): boolean {
    return (
      audience.primaryCountry !== undefined ||
      audience.primaryCity !== undefined ||
      audience.language !== undefined ||
      audience.niche !== undefined ||
      audience.isLocal !== undefined
    );
  }

  async updateTelegramChannel(
    id: string,
    channel: Partial<CreateTelegramChannelsDto>,
  ) {
    const fieldMap: Record<string, string> = {
      channelId: 'telegram_channel_id',
      channelUsername: 'username',
      channelName: 'title',
      category: 'category',
      subscribers: 'subscribers',
      avgViews: 'avg_views',
      pricePerPost: 'price_per_post',
      verified: 'verified',
      verificationMethod: 'verification_method',
      trustScore: 'trust_score',
      avatarUrl: 'avatar_url',
    };

    const updateData: any = {};

    for (const [dtoKey, dbColumn] of Object.entries(fieldMap)) {
      const value = channel[dtoKey as keyof typeof channel];

      if (value !== undefined) {
        updateData[dbColumn] =
          dtoKey === 'pricePerPost' ? value.toString() : value;
      }
    }

    const updated = await this.drizzle
      .update(schema.telegram_channels)
      .set(updateData)
      .where(eq(schema.telegram_channels.id, id))
      .returning();

    return updated[0];
  }

  async deleteTelegramChannel(id: string) {
    await this.getTelegramChannelById(id);

    const deleted = await this.drizzle
      .delete(schema.telegram_channels)
      .where(eq(schema.telegram_channels.id, id))
      .returning();

    return deleted[0];
  }
}
