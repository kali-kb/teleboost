import { Injectable, Logger } from '@nestjs/common';
import { TelegramIdentityService } from '../api/telegram-identity/telegram-identity.service';
import { TelegramChannelService } from '../api/telegram-channel/telegram-channel.service';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly telegramIdentityService: TelegramIdentityService,
    private readonly telegramChannelService: TelegramChannelService,
  ) {}

  getWelcomeMessage(): string {
    return (
      `🚀 **Welcome to Teleboost Monetization!**\n\n` +
      `To join our network, your channel must meet these minimum requirements:\n` +
      `• 👥 **500+ Subscribers**\n` +
      `• 📈 **15% View-to-Subscriber Ratio**\n\n` +
      `Ready to start? Click the button below!`
    );
  }

  getHelpMessage(): string {
    return 'Available commands:\n/start - Initialize bot\n/help - Show this message\n\nSend any message and I will echo it!';
  }

  formatEcho(text: string): string {
    return `✨ You said: ${text}`;
  }

  async createOrUpdateTelegramIdentity(
    telegramId: string,
    userName: string,
    firstName: string,
  ) {
    try {
      const existingIdentity =
        await this.telegramIdentityService.findByTelegramId(telegramId);

      if (existingIdentity) {
        this.logger.log(`Telegram identity already exists for ${telegramId}`);
        return existingIdentity;
      }

      const identity = await this.telegramIdentityService.create({
        telegramId,
        userName,
        firstName,
      });

      this.logger.log(`Created telegram identity: ${identity.id}`);
      return identity;
    } catch (error) {
      this.logger.error(`Failed to create telegram identity: ${error.message}`);
      throw error;
    }
  }

  async createTelegramChannel(data: {
    ownerId: string;
    channelId: string;
    channelName: string;
    channelUsername: string;
    category: string;
    subscribers: number;
    avgViews: number;
    pricePerPost: number;
    trustScore: number;
    verified?: boolean;
    verificationMethod?: string;
    audience?: {
      primaryCountry?: string;
      primaryCity?: string;
      language?: string;
      niche?: string;
      isLocal?: boolean;
    };
  }) {
    try {
      const existingChannel =
        await this.telegramChannelService.findByTelegramChannelId(
          data.channelId,
        );

      if (existingChannel) {
        this.logger.log(
          `Telegram channel already exists for ${data.channelId}`,
        );
        return existingChannel;
      }

      const channel = await this.telegramChannelService.create(data);

      this.logger.log(`Created telegram channel: ${channel.id}`);
      return channel;
    } catch (error) {
      this.logger.error(`Failed to create telegram channel: ${error.message}`);
      throw error;
    }
  }

  async getChannelsByOwner(ownerId: string) {
    try {
      return await this.telegramChannelService.findByOwnerId(ownerId);
    } catch (error) {
      this.logger.error(
        `Failed to fetch channels for owner ${ownerId}: ${error.message}`,
      );
      throw error;
    }
  }
}
