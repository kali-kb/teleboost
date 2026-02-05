import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface CreateChannelAudienceDto {
  primaryCountry?: string;
  primaryCity?: string;
  language?: string;
  niche?: string;
  isLocal?: boolean;
}

export interface CreateTelegramChannelDto {
  ownerId: string;
  channelId: string;
  channelName: string;
  channelUsername: string;
  category: string;
  subscribers: number;
  avgViews: number;
  pricePerPost: number;
  verified?: boolean;
  verificationMethod?: string;
  trustScore: number;
  avatarUrl?: string;
  audience?: CreateChannelAudienceDto;
}

export interface TelegramChannel {
  id: string;
  owner_id: string;
  telegram_channel_id: string;
  username: string;
  title: string;
  category: string;
  subscribers: number;
  avg_views: number;
  price_per_post: string;
  verified: boolean;
  verification_method: string;
  trust_score: number;
  avatar_url: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class TelegramChannelService {
  private readonly logger = new Logger(TelegramChannelService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseURL =
      this.configService.get<string>('BACKEND_API_URL') ||
      'http://localhost:3001';

    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async create(data: CreateTelegramChannelDto): Promise<TelegramChannel> {
    try {
      const response = await this.client.post('/telegram-channels', data);
      return response.data;
    } catch (error) {
      if (error.response) {
        this.logger.error(`Failed to create telegram channel: ${JSON.stringify(error.response.data)}`);
      } else {
        this.logger.error(`Failed to create telegram channel: ${error.message}`);
      }
      throw error;
    }
  }

  async findAll(): Promise<TelegramChannel[]> {
    try {
      const response = await this.client.get('/telegram-channels');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch telegram channels: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string): Promise<TelegramChannel> {
    try {
      const response = await this.client.get(`/telegram-channels/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch telegram channel ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<CreateTelegramChannelDto>,
  ): Promise<TelegramChannel> {
    try {
      const response = await this.client.put(`/telegram-channels/${id}`, data);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to update telegram channel ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async remove(id: string): Promise<TelegramChannel> {
    try {
      const response = await this.client.delete(`/telegram-channels/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to delete telegram channel ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async findByOwnerId(ownerId: string): Promise<TelegramChannel[]> {
    try {
      const channels = await this.findAll();
      return channels.filter((channel) => channel.owner_id === ownerId);
    } catch (error) {
      this.logger.error(
        `Failed to find channels by owner ID ${ownerId}: ${error.message}`,
      );
      return [];
    }
  }

  async findByTelegramChannelId(
    telegramChannelId: string,
  ): Promise<TelegramChannel | null> {
    try {
      const channels = await this.findAll();
      return (
        channels.find(
          (channel) => channel.telegram_channel_id === telegramChannelId,
        ) || null
      );
    } catch (error) {
      this.logger.error(
        `Failed to find channel by telegram channel ID ${telegramChannelId}: ${error.message}`,
      );
      return null;
    }
  }
}
