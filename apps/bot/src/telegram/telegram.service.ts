import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramService {
    getWelcomeMessage(): string {
        return `🚀 **Welcome to Teleboost Monetization!**\n\n` +
            `To join our network, your channel must meet these minimum requirements:\n` +
            `• 👥 **500+ Subscribers**\n` +
            `• 📈 **15% View-to-Subscriber Ratio**\n\n` +
            `Ready to start? Click the button below!`;
    }

    getHelpMessage(): string {
        return 'Available commands:\n/start - Initialize the bot\n/help - Show this message\n\nSend any message and I will echo it!';
    }

    formatEcho(text: string): string {
        return `✨ You said: ${text}`;
    }
}
