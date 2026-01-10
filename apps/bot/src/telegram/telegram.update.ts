import { Update, Ctx, Start, Help, On, Message, Action } from 'nestjs-telegraf';
import { Context, Markup, Scenes } from 'telegraf';
import { TelegramService } from './telegram.service';
import { REGISTER_CHANNEL_WIZARD_ID } from './scenes/register-channel.scene';
import { EDIT_CHANNEL_WIZARD_ID } from './scenes/edit-channel.scene';
import { Injectable } from '@nestjs/common';

@Injectable()
@Update()
export class TelegramUpdate {
  constructor(private readonly telegramService: TelegramService) { }

  @Start()
  async onStart(@Ctx() ctx: Scenes.SceneContext) {
    console.log('--- /start command received ---');
    const from = ctx.from;
    console.log('From:', from);
    if (!from) {
      await ctx.reply('Could not identify you. Please try again.');
      return;
    }

    try {
      const identity =
        await this.telegramService.createOrUpdateTelegramIdentity(
          from.id.toString(),
          from.username || 'unknown',
          from.first_name,
        );

      console.log('Identity created/updated:', identity.id);
      const session = ctx.session as any;
      if (session) {
        session.userIdentity = identity;
        session.ownerId = identity.id;
        console.log('Session updated with identity');
      } else {
        console.warn('No session found in context');
      }
    } catch (error) {
      console.error('Failed to create user identity:', error);
      await ctx.reply(
        'Welcome! There was an issue setting up your account, but you can still continue.',
      );
    }

    await this.showMainMenu(ctx);
  }

  async showMainMenu(@Ctx() ctx: Scenes.SceneContext) {
    const text = this.telegramService.getWelcomeMessage();
    const keyboard = Markup.keyboard([
      ['📢 Register Channel', '⚙️ Manage My Channels'],
    ]).resize();

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      ...keyboard,
    });
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(this.telegramService.getHelpMessage());
  }

  @Action('reset_session')
  async onResetAction(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.answerCbQuery('Session reset! 🔄');
    (ctx as any).session = {};
    await ctx.scene.leave();
    await this.onStart(ctx);
  }

  @Action('back_to_start')
  async onBackToStart(@Ctx() ctx: Scenes.SceneContext) {
    try {
      await ctx.answerCbQuery();
      await ctx.editMessageText('🏠 Returning to main menu...');
    } catch (e) {
      // Ignore if message already deleted or too old
    }
    await this.showMainMenu(ctx);
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

  @Action('manage_channels')
  async onManageChannels(@Ctx() ctx: Scenes.SceneContext) {
    const session = ctx.session as any;
    const ownerId = session?.ownerId;

    if (!ownerId) {
      const from = ctx.from;
      if (from) {
        const identity =
          await this.telegramService.createOrUpdateTelegramIdentity(
            from.id.toString(),
            from.username || 'unknown',
            from.first_name,
          );
        session.ownerId = identity.id;
      } else {
        await ctx.reply('Session expired. Please use /start again.');
        return;
      }
    }

    try {
      const channels = await this.telegramService.getChannelsByOwner(
        session.ownerId,
      );

      if (channels.length === 0) {
        const text =
          '📂 **No channels registered yet.**\n\nClick the button below to register your first channel!';
        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('📢 Register Channel', 'register_channel')],
          [Markup.button.callback('🏠 Back', 'back_to_start')],
        ]);

        if (ctx.callbackQuery) {
          await ctx.editMessageText(text, {
            parse_mode: 'Markdown',
            ...keyboard,
          });
        } else {
          await ctx.reply(text, {
            parse_mode: 'Markdown',
            ...keyboard,
          });
        }
        return;
      }

      const buttons = channels.map((channel: any) => [
        Markup.button.callback(
          `${channel.verified ? '✅' : '⏳'} ${channel.title}`,
          `view_chan:${channel.id}`,
        ),
      ]);

      buttons.push([
        Markup.button.callback('🏠 Back to Main Menu', 'back_to_start'),
      ]);

      const text = '📂 **Your Registered Channels**\n\nSelect a channel to manage:';
      const keyboard = Markup.inlineKeyboard(buttons);

      if (ctx.callbackQuery) {
        await ctx.editMessageText(text, {
          parse_mode: 'Markdown',
          ...keyboard,
        });
      } else {
        await ctx.reply(text, {
          parse_mode: 'Markdown',
          ...keyboard,
        });
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      await ctx.reply('Failed to load your channels. Please try again later.');
    }
  }

  @Action(/^view_chan:(.+)$/)
  async onViewChannel(@Ctx() ctx: Scenes.SceneContext) {
    const channelId = (ctx as any).match[1];
    try {
      const channel = await this.telegramService.getChannelById(channelId);

      const details =
        `📢 **Channel:** ${channel.title}\n` +
        `📦 **Category:** ${channel.category}\n` +
        `👥 **Subscribers:** ${channel.subscribers.toLocaleString()}\n` +
        `👁️ **Avg Views:** ${channel.avg_views.toLocaleString()}\n` +
        `💰 **Price:** ${channel.price_per_post} ETB\n` +
        `⭐ **Trust Score:** ${channel.trust_score}\n` +
        `✅ **Verified:** ${channel.verified ? 'Yes' : 'No'}\n` +
        `📅 **Registered:** ${new Date(channel.created_at).toLocaleDateString()}`;

      await ctx.editMessageText(details, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '📝 Edit Details',
              `edit_chan:${channel.id}`,
            ),
          ],
          [
            Markup.button.callback(
              '🗑️ Delete Channel',
              `del_chan_conf:${channel.id}`,
            ),
          ],
          [Markup.button.callback('⬅️ Back to List', 'manage_channels')],
        ]),
      });
    } catch (error) {
      console.error('Failed to fetch channel details:', error);
      await ctx.answerCbQuery('Failed to load channel details.', {
        show_alert: true,
      });
    }
  }

  @Action(/^edit_chan:(.+)$/)
  async onEditChannel(@Ctx() ctx: Scenes.SceneContext) {
    const channelId = (ctx as any).match[1];
    try {
      const channel = await this.telegramService.getChannelById(channelId);
      await ctx.answerCbQuery();
      await ctx.editMessageText(`Starting edit for **${channel.title}**...`, { parse_mode: 'Markdown' });

      await ctx.scene.enter(EDIT_CHANNEL_WIZARD_ID, {
        id: channel.id,
        channelTitle: channel.title,
      });
    } catch (error) {
      console.error('Failed to enter edit wizard:', error);
      await ctx.answerCbQuery('Failed to start editing.', { show_alert: true });
    }
  }

  @Action(/^del_chan_conf:(.+)$/)
  async onDeleteChannelConfirm(@Ctx() ctx: Scenes.SceneContext) {
    const channelId = (ctx as any).match[1];
    await ctx.editMessageText(
      '⚠️ **Are you sure you want to delete this channel?**\n\nThis action cannot be undone.',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '✅ Yes, Delete',
              `del_chan_exec:${channelId}`,
            ),
          ],
          [Markup.button.callback('❌ Cancel', `view_chan:${channelId}`)],
        ]),
      },
    );
  }

  @Action(/^del_chan_exec:(.+)$/)
  async onDeleteChannel(@Ctx() ctx: Scenes.SceneContext) {
    const channelId = (ctx as any).match[1];
    try {
      await this.telegramService.deleteChannel(channelId);
      await ctx.answerCbQuery('Channel deleted successfully! ✅');
      await this.onManageChannels(ctx);
    } catch (error) {
      console.error('Failed to delete channel:', error);
      await ctx.answerCbQuery('Failed to delete channel. Please try again.', {
        show_alert: true,
      });
    }
  }

  @On('chat_shared')
  async onChatShared(@Ctx() ctx: Scenes.SceneContext) {
    const message = ctx.message as any;
    const session = ctx.session as any;
    console.log('--- chat_shared received ---');
    console.log('Session ownerId:', session?.ownerId);

    if (message?.chat_shared) {
      const chatShared = message.chat_shared;
      try {
        const chat = await ctx.telegram.getChat(chatShared.chat_id);
        const title = (chat as any).title || 'Channel';
        const username = (chat as any).username;

        console.log(`Entering wizard for channel ${chatShared.chat_id} with ownerId ${session?.ownerId}`);

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
  async onMessage(@Ctx() ctx: Scenes.SceneContext, @Message('text') text: string) {
    if (!text || text.startsWith('/')) return;

    console.log('--- Text message received ---');
    console.log('Text:', text);

    if (text === '/reset' || text === '/cancel') {
      (ctx as any).session = {};
      if (ctx.scene) await ctx.scene.leave();
      await ctx.reply('Session cleared. Restarting...');
      return this.onStart(ctx);
    }

    if (text === '📢 Register Channel') {
      return this.onRegisterChannel(ctx);
    }

    if (text === '⚙️ Manage My Channels') {
      return this.onManageChannels(ctx);
    }

    const response = this.telegramService.formatEcho(text);
    await ctx.reply(response);
  }
}
