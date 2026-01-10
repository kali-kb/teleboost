import { Wizard, WizardStep, Ctx, Message, On, Action } from 'nestjs-telegraf';
import { Scenes, Markup } from 'telegraf';
import { TelegramService } from '../telegram.service';
import { Injectable } from '@nestjs/common';

export const EDIT_CHANNEL_WIZARD_ID = 'EDIT_CHANNEL_WIZARD_ID';

@Injectable()
@Wizard(EDIT_CHANNEL_WIZARD_ID)
export class EditChannelWizard {
    constructor(private readonly telegramService: TelegramService) { }

    @WizardStep(1)
    async step1(@Ctx() ctx: Scenes.WizardContext) {
        const state = ctx.wizard.state as any;

        await ctx.reply(
            `📝 **Editing Channel**: ${state.channelTitle}\n\n` +
            `What would you like to edit?`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('💰 Change Price', 'edit_price')],
                    [Markup.button.callback('📂 Change Category', 'edit_category')],
                    [Markup.button.callback('❌ Cancel', 'cancel_edit')],
                ]),
            }
        );
    }

    @Action('edit_price')
    async onEditPrice(@Ctx() ctx: Scenes.WizardContext) {
        await ctx.answerCbQuery();
        await ctx.reply('Enter the new **price per post** in ETB:', { parse_mode: 'Markdown' });
        (ctx.wizard.state as any).editField = 'price';
        ctx.wizard.next();
    }

    @Action('edit_category')
    async onEditCategory(@Ctx() ctx: Scenes.WizardContext) {
        await ctx.answerCbQuery();
        await ctx.reply(
            'Select the new **category** for your channel:',
            {
                parse_mode: 'Markdown',
                ...Markup.keyboard([
                    ['Crypto', 'News', 'Lifestyle'],
                    ['Entertainment', 'Technology', 'Business'],
                    ['Education', 'Sports', 'Finance'],
                    ['Fashion', 'Food'],
                    ['Religion', 'Music'],
                    ['Travel', 'Gaming', 'Other'],
                ])
                    .resize()
                    .oneTime(),
            }
        );
        (ctx.wizard.state as any).editField = 'category';
        ctx.wizard.next();
    }

    @On('text')
    @WizardStep(2)
    async step2(
        @Ctx() ctx: Scenes.WizardContext,
        @Message('text') input: string,
    ) {
        const state = ctx.wizard.state as any;
        const field = state.editField;

        if (field === 'price') {
            const price = parseFloat(input);
            if (isNaN(price)) {
                await ctx.reply('Please enter a valid number for the price.');
                return;
            }
            state.newValue = price;
        } else if (field === 'category') {
            state.newValue = input;
        }

        await ctx.reply(
            `Confirm change: **${field}** to **${state.newValue}**?`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('✅ Confirm', 'confirm_edit')],
                    [Markup.button.callback('❌ Cancel', 'cancel_edit')],
                ]),
            }
        );
    }

    @Action('confirm_edit')
    async onConfirmEdit(@Ctx() ctx: Scenes.WizardContext) {
        const state = ctx.wizard.state as any;
        const field = state.editField;
        const value = state.newValue;

        try {
            const updateData: any = {};
            if (field === 'price') updateData.pricePerPost = value;
            if (field === 'category') updateData.category = value;

            await this.telegramService.updateChannel(state.id, updateData);

            await ctx.answerCbQuery('Updated successfully! ✅');
            await ctx.reply(
                'Channel updated successfully! 🎉',
                Markup.keyboard([
                    ['📢 Register Channel', '⚙️ Manage My Channels'],
                ]).resize(),
            );
            await ctx.scene.leave();
        } catch (error) {
            console.error('Failed to update channel:', error);
            await ctx.answerCbQuery('Failed to update. Please try again.', { show_alert: true });
        }
    }

    @Action('cancel_edit')
    async onCancel(@Ctx() ctx: Scenes.WizardContext) {
        await ctx.answerCbQuery();
        await ctx.reply(
            'Edit cancelled.',
            Markup.keyboard([
                ['📢 Register Channel', '⚙️ Manage My Channels'],
            ]).resize(),
        );
        await ctx.scene.leave();
    }
}
