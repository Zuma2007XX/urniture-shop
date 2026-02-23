import dotenv from 'dotenv';
dotenv.config();

import { sendTelegramMessage } from '../src/lib/telegram';

async function test() {
    console.log('Sending test message to Telegram...');
    const text = `
✅ <b>Бот успішно підключено!</b>
Тепер ви будете отримувати сповіщення про нові замовлення сюди.
`;
    const success = await sendTelegramMessage(text, 'HTML');
    if (success) {
        console.log('Test message sent successfully!');
    } else {
        console.error('Failed to send test message.');
    }
}

test();
