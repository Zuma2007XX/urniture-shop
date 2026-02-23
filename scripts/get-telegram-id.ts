import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error('No token found');
    process.exit(1);
}

async function getChatId() {
    try {
        console.log('Fetching updates from Telegram API...');
        const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
        const data = await response.json();

        if (data.ok && data.result.length > 0) {
            const chatIds = new Set();
            data.result.forEach((update: any) => {
                const message = update.message || update.channel_post;
                if (message && message.chat) {
                    console.log(`Found interaction from: ${message.chat.first_name || 'User'} (ID: ${message.chat.id}) - Text: ${message.text}`);
                    chatIds.add(message.chat.id);
                }
            });
            console.log('\n--- Found Chat IDs ---');
            chatIds.forEach(id => console.log(id));
            console.log('Copy the ID above and put it in .env under TELEGRAM_ADMIN_ID');
        } else {
            console.log('No recent messages found. Please send a message (e.g., /start) to the bot and run this script again.');
        }
    } catch (e) {
        console.error('Error fetching updates:', e);
    }
}

getChatId();
