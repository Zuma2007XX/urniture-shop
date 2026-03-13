import 'dotenv/config';
import { sendTelegramMessage } from '../src/lib/telegram';

async function main() {
    console.log('--- TELEGRAM TEST ---');
    console.log('Token exists:', !!process.env.TELEGRAM_BOT_TOKEN);
    console.log('Chat ID exists:', !!process.env.TELEGRAM_ADMIN_ID);

    const testMessage = '<b>🔔 TEST NOTIFICATION</b>\nThis is a test message from Antigravity bot.';
    const result = await sendTelegramMessage(testMessage, 'HTML');

    if (result) {
        console.log('✅ Telegram message sent successfully!');
    } else {
        console.log('❌ Failed to send Telegram message.');
    }
}

main().catch(console.error);
