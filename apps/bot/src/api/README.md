# Bot API Wrappers

This directory contains API client services that wrap the backend API calls.

## Available Services

### TelegramIdentityService

Handles telegram identity operations via backend API.

**Methods:**

- `create(data)` - Create new telegram identity
- `findAll()` - Get all telegram identities
- `findOne(id)` - Get telegram identity by ID
- `update(id, data)` - Update telegram identity
- `remove(id)` - Delete telegram identity
- `findByTelegramId(telegramId)` - Find identity by telegram ID

**Usage:**

```typescript
@Injectable()
export class YourService {
  constructor(
    private readonly telegramIdentityService: TelegramIdentityService,
  ) {}

  async registerUser(ctx: Context) {
    const identity = await this.telegramIdentityService.create({
      telegramId: ctx.from.id.toString(),
      userName: ctx.from.username || 'unknown',
      firstName: ctx.from.first_name,
    });
  }
}
```

### TelegramChannelService

Handles telegram channel operations via backend API.

**Methods:**

- `create(data)` - Create new telegram channel
- `findAll()` - Get all telegram channels
- `findOne(id)` - Get telegram channel by ID
- `update(id, data)` - Update telegram channel
- `remove(id)` - Delete telegram channel
- `findByOwnerId(ownerId)` - Find channels by owner ID
- `findByTelegramChannelId(telegramChannelId)` - Find channel by telegram channel ID

**Usage:**

```typescript
@Injectable()
export class YourService {
  constructor(
    private readonly telegramChannelService: TelegramChannelService,
  ) {}

  async registerChannel(channelData: any) {
    const channel = await this.telegramChannelService.create({
      ownerId: 'identity-id',
      channelId: 'channel-telegram-id',
      channelName: 'My Channel',
      channelUsername: '@mychannel',
      category: 'Technology',
      subscribers: 1000,
      avgViews: 500,
      pricePerPost: 10.5,
      trustScore: 85,
      audience: {
        primaryCountry: 'USA',
        language: 'English',
        niche: 'Tech enthusiasts',
      },
    });
  }
}
```

## Configuration

Add to `apps/bot/.env`:

```env
BACKEND_API_URL=http://localhost:3001
```

## Integration with TelegramService

The `TelegramService` has been updated to include helper methods:

- `createOrUpdateTelegramIdentity(telegramId, userName, firstName)` - Create or get existing identity
- `createTelegramChannel(data)` - Create channel with optional audience data
- `getChannelsByOwner(ownerId)` - Get all channels for a specific owner

## Error Handling

All API calls include automatic error logging via NestJS Logger. Errors are re-thrown for proper handling in bot logic.

Example error handling:

```typescript
try {
  await this.telegramChannelService.create(channelData);
  await ctx.reply('Channel registered successfully!');
} catch (error) {
  this.logger.error('Registration failed', error);
  await ctx.reply('Failed to register channel. Please try again.');
}
```
