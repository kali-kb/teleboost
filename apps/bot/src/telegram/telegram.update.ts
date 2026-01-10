import { Update, Ctx, Start, Help, On, Message, Action } from 'nestjs-telegraf';
import { Context, Markup, Scenes } from 'telegraf';
import { TelegramService } from './telegram.service';
import { REGISTER_CHANNEL_WIZARD_ID } from './register-channel.scene';

@Update()
export class TelegramUpdate {
  constructor(private readonly telegramService: TelegramService) {}

  @Start()
  async onStart(@Ctx() ctx: Scenes.SceneContext) {
    const from = ctx.from;
    if (!from) {
      await ctx.reply('Could not identify you. Please try again.');
      return;
    }

    try {
      console.log('identity created');
      const identity =
        await this.telegramService.createOrUpdateTelegramIdentity(
          from.id.toString(),
          from.username || 'unknown',
          from.first_name,
        );

      const session = ctx.scene as any;
      if (session.session) {
        session.session.userIdentity = identity;
        session.session.ownerId = identity.id;
      }
    } catch (error) {
      console.error('Failed to create user identity:', error);
      await ctx.reply(
        'Welcome! There was an issue setting up your account, but you can still continue.',
      );
    }

    await ctx.reply(this.telegramService.getWelcomeMessage(), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Register Channel',
              callback_data: 'register_channel',
            },
          ],
        ],
      },
    });
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(this.telegramService.getHelpMessage());
  }

  @Action('register_channel')
  async onRegisterChannel(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.reply(
      'Step 1: Add @teleboost_ad_bot to your channel.\n' +
        'Step 2: Grant the bot all permissions (except "Add New Admins").\n' +
        'Step 3: Click the button below to select the channel.',
      Markup.keyboard([
        Markup.button.channelRequest('Select Channel', 1, {
          user_administrator_rights: {
            is_anonymous: false,
            can_manage_chat: true,
            can_delete_messages: true,
            can_manage_video_chats: true,
            can_restrict_members: true,
            can_promote_members: true,
            can_change_info: true,
            can_invite_users: true,
            can_post_messages: true,
            can_edit_messages: true,
            can_pin_messages: true,
          },
          bot_is_member: true,
        }),
      ])
        .resize()
        .oneTime(),
    );
  }

  @On('chat_shared')
  async onChatShared(@Ctx() ctx: Scenes.SceneContext) {
    const message = ctx.message as any;
    const session = (ctx.scene as any).session;

    if (message?.chat_shared) {
      const chatShared = message.chat_shared;
      try {
        const chat = await ctx.telegram.getChat(chatShared.chat_id);
        const title = (chat as any).title || 'Channel';
        const username = (chat as any).username;

        await ctx.reply(
          `Successfully selected "${title}" (ID: ${chatShared.chat_id})! 🎯\n\nLet's get some more details.`,
          Markup.removeKeyboard(),
        );

        await ctx.scene.enter(REGISTER_CHANNEL_WIZARD_ID, {
          ownerId: session?.ownerId,
          channelId: chatShared.chat_id,
          title: title,
          username: username || chatShared.chat_id.toString(),
        });
      } catch (error) {
        console.error('Error fetching chat info:', error);
        await ctx.reply(
          `Selected channel (ID: ${chatShared.chat_id})! 🎯\n\nI couldn't fetch details, please try again or check my permissions.`,
          Markup.removeKeyboard(),
        );
      }
    }
  }

  @On('text')
  async onMessage(@Ctx() ctx: Context, @Message('text') text: string) {
    const response = this.telegramService.formatEcho(text);
    await ctx.reply(response);
  }
}
