import dotenv from 'dotenv';
dotenv.config();

// Ensure Prisma uses the loaded env vars
process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

import TelegramBot from 'node-telegram-bot-api';
import prisma from '../src/lib/prisma';

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminIdStr = process.env.TELEGRAM_ADMIN_ID;

if (!token) {
    console.error('Fatal: TELEGRAM_BOT_TOKEN is missing in .env');
    process.exit(1);
}

const adminId = adminIdStr ? parseInt(adminIdStr, 10) : null;

// Initialize bot with polling
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram Bot Server is running...');
if (adminId) {
    console.log(`Listening for commands from Admin ID: ${adminId}`);
} else {
    console.warn('⚠️ TELEGRAM_ADMIN_ID is not set. The bot will respond to anyone!');
}

// Reusable custom keyboard
const mainMenuOpts = {
    reply_markup: {
        keyboard: [
            [{ text: '🆕 Нові замовлення' }, { text: '📦 Відправлені' }],
            [{ text: '📊 Статистика' }]
        ],
        resize_keyboard: true,
        persistent: true
    },
    parse_mode: 'HTML' as const
};

// State to track previous message IDs so we can delete them
// Map<chatId, number[]>
const previousMessageIds = new Map<number, number[]>();

async function clearPreviousMessages(chatId: number) {
    const msgIds = previousMessageIds.get(chatId);
    if (msgIds && msgIds.length > 0) {
        for (const msgId of msgIds) {
            try {
                await bot.deleteMessage(chatId, msgId);
            } catch (err) {
                // Message might be too old to delete or already deleted
            }
        }
        previousMessageIds.set(chatId, []); // Clear the array
    }
}

function trackMessage(chatId: number, msgId: number) {
    const current = previousMessageIds.get(chatId) || [];
    current.push(msgId);
    previousMessageIds.set(chatId, current);
}

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    // Optional: Only allow the admin
    if (adminId && chatId !== adminId) {
        return bot.sendMessage(chatId, 'Вибачте, цей бот тільки для адміністратора магазину.');
    }

    bot.sendMessage(chatId, '👋 Привіт! Я бот вашого меблевого магазину.\nОберіть потрібний розділ меню нижче:', mainMenuOpts);
});

// Handle regular messages (Menu clicks)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Security check
    if (adminId && chatId !== adminId) return;
    if (!text || text === '/start') return;

    try {
        // Clear previous output messages when user clicks a new menu option
        if (['🆕 Нові замовлення', '📦 Відправлені', '📊 Статистика'].includes(text)) {
            await clearPreviousMessages(chatId);
            // Try to delete the user's command message too for a cleaner chat
            try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) { }
        }

        if (text === '🆕 Нові замовлення') {
            await handleNewOrders(chatId);
        } else if (text === '📦 Відправлені') {
            await handleShippedOrders(chatId);
        } else if (text === '📊 Статистика') {
            await handleStatistics(chatId);
        } else {
            bot.sendMessage(chatId, 'Невідома команда. Оберіть пункт меню.', mainMenuOpts);
        }
    } catch (err) {
        console.error('Error handling message:', err);
        bot.sendMessage(chatId, '❌ Виникла помилка при обробці запиту.');
    }
});

// Callback queries (Inline buttons)
bot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data; // e.g., 'mark_shipped_ORDID'

    if (!chatId || !data) return;

    try {
        if (data.startsWith('mark_shipped_')) {
            const orderId = data.replace('mark_shipped_', '');

            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'shipped' }
            });

            bot.answerCallbackQuery(query.id, { text: '✅ Замовлення позначено як відправлене!' });

            // Edit the original message to remove the inline button
            if (query.message) {
                bot.editMessageText(query.message.text + '\n\n<i>[✅ Відправлено]</i>', {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: 'HTML'
                });
            }
        }
    } catch (err) {
        console.error('Error in callback query:', err);
        bot.answerCallbackQuery(query.id, { text: '❌ Помилка при оновленні', show_alert: true });
    }
});

// ---------------------------------------------------------
// Feature Handlers
// ---------------------------------------------------------

async function handleNewOrders(chatId: number) {
    bot.sendMessage(chatId, '⏳ Шукаю нові замовлення...');

    const orders = await prisma.order.findMany({
        where: { status: 'pending' },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5 // Limit to 5 most recent to avoid spam
    });

    if (orders.length === 0) {
        const msg = await bot.sendMessage(chatId, '😎 У вас немає нових замовлень на цей момент.', mainMenuOpts);
        trackMessage(chatId, msg.message_id);
        return;
    }

    const infoMsg = await bot.sendMessage(chatId, `Знайдено ${orders.length} останніх нових замовлень:`);
    trackMessage(chatId, infoMsg.message_id);

    for (const order of orders) {
        const itemsList = order.items.map(i => `- ${i.product?.name || 'Товар'} (${i.quantity} шт) - ${i.price}₴`).join('\n');

        const message = `
<b>🛒 ЗАМОВЛЕННЯ #${order.id.slice(-6)}</b>
<b>Клієнт:</b> ${order.firstName} ${order.lastName}
<b>Тел:</b> ${order.phone}
<b>Доставка:</b> ${order.deliveryMethod} (${order.city || ''}, ${order.branch || order.address || ''})
<b>Оплата:</b> ${order.paymentMethod}
<b>Сума:</b> ${order.total} ₴

<b>Товари:</b>
${itemsList}
`;

        // Add inline button to mark as shipped
        const opts = {
            parse_mode: 'HTML' as const,
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📦 Позначити як "Відправлено"', callback_data: `mark_shipped_${order.id}` }]
                ]
            }
        };

        await bot.sendMessage(chatId, message, opts).then(sentMsg => {
            trackMessage(chatId, sentMsg.message_id);
        });
    }
}

async function handleShippedOrders(chatId: number) {
    const orders = await prisma.order.findMany({
        where: { status: 'shipped' },
        orderBy: { updatedAt: 'desc' },
        take: 10
    });

    if (orders.length === 0) {
        const m = await bot.sendMessage(chatId, 'Поки немає відправлених замовлень.', mainMenuOpts);
        trackMessage(chatId, m.message_id);
        return;
    }

    let msgText = '<b>📦 Останні відправлені замовлення:</b>\n\n';
    orders.forEach(o => {
        msgText += `• #${o.id.slice(-6)} - ${o.firstName} ${o.lastName} (${o.total} ₴)\n`;
    });

    const m = await bot.sendMessage(chatId, msgText, mainMenuOpts);
    trackMessage(chatId, m.message_id);
}

async function handleStatistics(chatId: number) {
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: 'pending' } });
    const shippedOrders = await prisma.order.count({ where: { status: 'shipped' } });

    const allOrders = await prisma.order.findMany({
        select: { total: true }
    });

    const totalRevenue = allOrders.reduce((acc, curr) => acc + curr.total, 0);

    const msgText = `
<b>📊 СТАТИСТИКА МАГАЗИНУ</b>

Всього замовлень: <b>${totalOrders}</b>
Нових (в обробці): <b>${pendingOrders}</b>
Відправлених: <b>${shippedOrders}</b>

💰 Загальний дохід: <b>${totalRevenue} ₴</b>
`;

    const m = await bot.sendMessage(chatId, msgText, mainMenuOpts);
    trackMessage(chatId, m.message_id);
}
