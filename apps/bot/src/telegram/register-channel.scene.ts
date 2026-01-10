import { Wizard, WizardStep, Ctx, Message, On, Action } from 'nestjs-telegraf';
import { Scenes, Markup } from 'telegraf';
import { TelegramService } from './telegram.service';

export const REGISTER_CHANNEL_WIZARD_ID = 'REGISTER_CHANNEL_WIZARD_ID';

@Wizard(REGISTER_CHANNEL_WIZARD_ID)
export class RegisterChannelWizard {
  private uiTimers = new Map<number, NodeJS.Timeout>();

  constructor(private readonly telegramService: TelegramService) {}

  @WizardStep(1)
  async step1(@Ctx() ctx: Scenes.WizardContext) {
    const state = ctx.wizard.state as any;

    await ctx.reply(
      `🔍 **Checking Monetization Status**\n\n` +
        `Verifying your channel meets the minimum requirements...`,
      { parse_mode: 'Markdown' },
    );

    try {
      const memberCount = await ctx.telegram.getChatMembersCount(
        state.channelId,
      );
      state.subscribers = memberCount;

      if (memberCount < 1) {
        await ctx.reply(
          `❌ **Requirement Not Met**\n\n` +
            `Your channel has **${memberCount}** subscribers. You need at least **500** to join Teleboost. ` +
            `Please come back once your channel grows!`,
          { parse_mode: 'Markdown' },
        );
        await ctx.scene.leave();
        return;
      }

      await ctx.reply(
        `✅ Subscriber count verified: **${memberCount}**\n\n` +
          `Now, what is the **category** of your channel?`,
        {
          parse_mode: 'Markdown',
          ...Markup.keyboard([
            ['Crypto', 'News', 'Lifestyle'],
            ['Entertainment', 'Technology', 'Business'],
            ['Education', 'Sports', 'Health'],
            ['Fashion', 'Food'],
            ['Religion', 'Music', 'Health'],
            ['Travel', 'Gaming', 'Other'],
          ])
            .resize()
            .oneTime(),
        },
      );
      ctx.wizard.next();
    } catch (error) {
      console.error('Error fetching member count:', error);
      await ctx.reply(
        'I had trouble verifying your subscriber count automatically. Please ensure I am an admin in the channel and try again.',
      );
      await ctx.scene.leave();
    }
  }

  @On('text')
  @WizardStep(2)
  async step2(
    @Ctx() ctx: Scenes.WizardContext,
    @Message('text') category: string,
  ) {
    const state = ctx.wizard.state as any;
    state.category = category;
    state.view_counts = []; // Initialize array for multiple posts

    await ctx.reply(
      `Category set to "${category}".\n\nTo calculate average views more accurately, please **forward one or more recent posts** from your channel. 📢\n\nYou can forward them one by one or as a batch.`,
      Markup.removeKeyboard(),
    );
    ctx.wizard.next();
  }

  @On(['message'])
  @WizardStep(3)
  async step3(@Ctx() ctx: Scenes.WizardContext) {
    const message = ctx.message as any;
    const state = ctx.wizard.state as any;

    if (!message.forward_from_chat) return;

    // Validation: Must be from the correct channel
    if (String(message.forward_from_chat.id) !== String(state.channelId)) {
      // Silently ignore or send a subtle warning if it's the first time
      if (!state.wrong_channel_warned) {
        await ctx.reply(
          'This post is from a different channel. Please forward posts specifically from your selected channel.',
        );
        state.wrong_channel_warned = true;
      }
      return;
    }

    // Deduplication Logic
    state.processed_msg_ids = state.processed_msg_ids || [];
    const msgKey = `${message.forward_from_chat.id}_${message.forward_from_message_id}`;

    // Skip if we already processed this exact message
    if (state.processed_msg_ids.includes(msgKey)) return;
    state.processed_msg_ids.push(msgKey);

    // Handle Media Groups (Albums/Multiple Images)
    // We only want to count an album as ONE post for the average
    if (message.media_group_id) {
      state.processed_groups = state.processed_groups || [];
      if (state.processed_groups.includes(message.media_group_id)) return;
      state.processed_groups.push(message.media_group_id);
    }

    // Collect Views (Scrape if needed)
    const views = await this.getViews(message);
    if (views !== undefined) {
      state.view_counts.push(views);
      console.log(
        `Collected views for message ${message.message_id}: ${views}`,
      );
    }

    // Debounced UI Update - Bundles multiple rapid forwards into one UI refresh
    this.scheduleUIUpdate(ctx);
  }

  private async getViews(message: any): Promise<number | undefined> {
    let views = message.views;
    if (views === undefined && message.forward_from_chat?.username) {
      try {
        const url = `https://t.me/${message.forward_from_chat.username}/${message.forward_from_message_id}?embed=1`;
        const response = await fetch(url);
        const html = await response.text();
        const match = html.match(
          /<span class="tgme_widget_message_views">([^<]+)<\/span>/,
        );
        if (match) {
          const viewsStr = match[1].trim();
          if (viewsStr.includes('K')) {
            return Math.round(parseFloat(viewsStr.replace('K', '')) * 1000);
          } else if (viewsStr.includes('M')) {
            return Math.round(parseFloat(viewsStr.replace('M', '')) * 1000000);
          } else {
            return parseInt(viewsStr.replace(/[^0-9]/g, ''), 10);
          }
        }
      } catch (error) {
        console.error('Scraping error:', error);
      }
    }
    return views;
  }

  private scheduleUIUpdate(ctx: Scenes.WizardContext) {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    if (this.uiTimers.has(chatId)) {
      clearTimeout(this.uiTimers.get(chatId));
    }

    this.uiTimers.set(
      chatId,
      setTimeout(() => {
        this.updateVerificationUI(ctx);
        this.uiTimers.delete(chatId);
      }, 1000),
    ); // Wait 1 second for any other messages in the batch
  }

  private async updateVerificationUI(ctx: Scenes.WizardContext) {
    if (!ctx.chat) return;
    const state = ctx.wizard.state as any;
    const count = state.view_counts.length;
    if (count === 0) return;

    const avg = Math.round(
      state.view_counts.reduce((a: number, b: number) => a + b, 0) / count,
    );
    const text =
      `📊 **Verification Progress**\n\n` +
      `Posts collected: **${count}**\n` +
      `Current average views: **${avg.toLocaleString()}**\n\n` +
      `Forward more posts to improve the accuracy of your trust score, or click the button below to finish.`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('✅ Finish & Continue', 'finish_verification')],
    ]);

    try {
      if (state.summary_message_id) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          state.summary_message_id,
          undefined,
          text,
          { parse_mode: 'Markdown', ...keyboard },
        );
      } else {
        const sent = await ctx.reply(text, {
          parse_mode: 'Markdown',
          ...keyboard,
        });
        state.summary_message_id = sent.message_id;
      }
    } catch (error) {
      // If edit fails (e.g. message deleted), send a new one
      const sent = await ctx.reply(text, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
      state.summary_message_id = sent.message_id;
    }
  }

  @Action('finish_verification')
  async onFinishVerification(@Ctx() ctx: Scenes.WizardContext) {
    const state = ctx.wizard.state as any;
    if (!state.view_counts || state.view_counts.length === 0) {
      await ctx.answerCbQuery('Please forward at least one post first!', {
        show_alert: true,
      });
      return;
    }

    const count = state.view_counts.length;
    const avg = Math.round(
      state.view_counts.reduce((a: number, b: number) => a + b, 0) / count,
    );
    const subscribers = state.subscribers || 1;
    const engagementRatio = avg / subscribers;

    if (engagementRatio < 0.15) {
      const percentage = (engagementRatio * 100).toFixed(1);
      await ctx.answerCbQuery();
      await ctx.reply(
        `❌ **Verification Failed**\n\n` +
          `Your average views (**${avg}**) relative to subscribers (**${subscribers}**) is **${percentage}%**.\n\n` +
          `Teleboost requires a minimum of **15%** engagement to monetize. ` +
          `Please try again once your engagement improves.`,
        { parse_mode: 'Markdown' },
      );
      await ctx.scene.leave();
      return;
    }

    state.avg_views = avg;
    const reachRatio = Math.min(engagementRatio, 1);
    state.trust_score = Math.round(50 + reachRatio * 50);

    await ctx.answerCbQuery();
    await ctx.reply(
      `Verification complete! ✅\n` +
        `Average views: **${avg.toLocaleString()}** (${(engagementRatio * 100).toFixed(1)}% engagement).\n\n` +
        `What is the **primary country** of your audience? (Optional)`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('⏭️ Skip Country', 'skip_country')],
        ]),
      },
    );
    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(4)
  async step4(
    @Ctx() ctx: Scenes.WizardContext,
    @Message('text') country?: string,
  ) {
    const state = ctx.wizard.state as any;
    if (country) state.primary_country = country;

    await ctx.reply(
      `Primary country set to: **${country || 'Skipped'}**.\n\n` +
        `What is the **primary city** of your audience? (Optional)`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('⏭️ Skip City', 'skip_city')],
        ]),
      },
    );
    ctx.wizard.next();
  }

  @Action('skip_country')
  async onSkipCountry(@Ctx() ctx: Scenes.WizardContext) {
    await ctx.answerCbQuery();
    return this.step4(ctx);
  }

  @On('text')
  @WizardStep(5)
  async step5(
    @Ctx() ctx: Scenes.WizardContext,
    @Message('text') city?: string,
  ) {
    const state = ctx.wizard.state as any;
    if (city) state.primary_city = city;

    await ctx.reply(
      `Primary city set to: **${city || 'Skipped'}**.\n\n` +
        `What is the **primary language** of your audience? (e.g. Amharic, English) (Optional)`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('⏭️ Skip Language', 'skip_language')],
        ]),
      },
    );
    ctx.wizard.next();
  }

  @Action('skip_city')
  async onSkipCity(@Ctx() ctx: Scenes.WizardContext) {
    await ctx.answerCbQuery();
    return this.step5(ctx);
  }

  @On('text')
  @WizardStep(6)
  async step6(
    @Ctx() ctx: Scenes.WizardContext,
    @Message('text') language?: string,
  ) {
    const state = ctx.wizard.state as any;
    if (language) state.language = language;

    await ctx.reply(
      `Language set to: **${language || 'Skipped'}**.\n\n` +
        `What is the **audience niche**? (e.g. High-income professionals, Students) (Optional)`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('⏭️ Skip Niche', 'skip_niche')],
        ]),
      },
    );
    ctx.wizard.next();
  }

  @Action('skip_language')
  async onSkipLanguage(@Ctx() ctx: Scenes.WizardContext) {
    await ctx.answerCbQuery();
    return this.step6(ctx);
  }

  @On('text')
  @WizardStep(7)
  async step7(
    @Ctx() ctx: Scenes.WizardContext,
    @Message('text') niche?: string,
  ) {
    const state = ctx.wizard.state as any;
    if (niche) state.niche = niche;

    await ctx.reply(`Finally, what is the price per post in **ETB**?`);
    ctx.wizard.next();
  }

  @Action('skip_niche')
  async onSkipNiche(@Ctx() ctx: Scenes.WizardContext) {
    await ctx.answerCbQuery();
    return this.step7(ctx);
  }

  @On('text')
  @WizardStep(8)
  async step8(
    @Ctx() ctx: Scenes.WizardContext,
    @Message('text') priceInput: string,
  ) {
    const price = parseFloat(priceInput);
    if (isNaN(price)) {
      await ctx.reply('Please enter a valid number for the price in ETB.');
      return;
    }

    const state = ctx.wizard.state as any;
    state.price_per_post = price;

    const {
      title,
      category,
      subscribers,
      avg_views,
      price_per_post,
      primary_country,
      primary_city,
      language,
      niche,
    } = state;

    let details =
      `📢 **Channel:** ${title}\n` +
      `👥 **Subscribers:** ${subscribers || 'Unknown'}\n` +
      `📂 **Category:** ${category}\n` +
      `👁️ **Avg Views:** ${avg_views}\n` +
      `💰 **Price:** ${price_per_post} ETB\n`;

    if (primary_country || primary_city || language || niche) {
      details +=
        `\n🎯 **Audience Targeting:**\n` +
        (primary_country ? `🌍 Country: ${primary_country}\n` : '') +
        (primary_city ? `🏙️ City: ${primary_city}\n` : '') +
        (language ? `🗣️ Language: ${language}\n` : '') +
        (niche ? `🧩 Niche: ${niche}\n` : '');
    }

    await ctx.reply(
      `Please confirm the registration details:\n\n${details}\n` +
        `Do you want to register this channel?`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('✅ Confirm Registration', 'confirm_reg')],
          [Markup.button.callback('❌ Cancel', 'cancel_reg')],
        ]),
      },
    );
    ctx.wizard.next();
  }

  @Action('confirm_reg')
  async onConfirm(@Ctx() ctx: Scenes.WizardContext) {
    const state = ctx.wizard.state as any;

    try {
      const channel = await this.telegramService.createTelegramChannel({
        ownerId: state.ownerId,
        channelId: state.channelId.toString(),
        channelName: state.title,
        channelUsername: state.username,
        category: state.category,
        subscribers: state.subscribers,
        avgViews: state.avg_views,
        pricePerPost: state.price_per_post,
        trustScore: state.trust_score,
        verified: false,
        verificationMethod: 'bot',
        audience: {
          primaryCountry: state.primary_country,
          primaryCity: state.primary_city,
          language: state.language,
          niche: state.niche,
        },
      });

      await ctx.answerCbQuery();
      await ctx.reply(
        `Channel registered successfully! 🎉\n\nChannel ID: ${channel.id}\n\nWelcome to Teleboost.`,
      );
      await ctx.scene.leave();
    } catch (error) {
      console.error('Failed to register channel:', error);
      await ctx.answerCbQuery('Registration failed. Please try again.', {
        show_alert: true,
      });
    }
  }

  @Action('cancel_reg')
  async onCancel(@Ctx() ctx: Scenes.WizardContext) {
    await ctx.answerCbQuery();
    await ctx.reply('Registration cancelled.');
    await ctx.scene.leave();
  }
}
