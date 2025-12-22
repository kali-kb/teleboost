import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramService {
    getWelcomeMessage(): string {
        return 'Welcome to Teleboost! 🚀\nYour premium Telegram assistant is ready.';
    }

    getHelpMessage(): string {
        return 'Available commands:\n/start - Initialize the bot\n/help - Show this message\n\nSend any message and I will echo it!';
    }

    formatEcho(text: string): string {
        return `✨ You said: ${text}`;
    }
}
