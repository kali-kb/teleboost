import { Update, Ctx, Start, Help, On, Message } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramService } from './telegram.service';

@Update()
export class TelegramUpdate {
    constructor(private readonly telegramService: TelegramService) { }

    @Start()
    async onStart(@Ctx() ctx: Context) {
        await ctx.reply(this.telegramService.getWelcomeMessage());
    }

    @Help()
    async onHelp(@Ctx() ctx: Context) {
        await ctx.reply(this.telegramService.getHelpMessage());
    }

    @On('text')
    async onMessage(@Ctx() ctx: Context, @Message('text') text: string) {
        const response = this.telegramService.formatEcho(text);
        await ctx.reply(response);
    }
}
