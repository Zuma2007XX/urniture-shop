/**
 * Telegram Bot for SM Furniture
 * Handles commands, inline buttons, and provides admin notifications
 * 
 * Run: npx tsx scripts/telegram-bot.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import TelegramBot from 'node-telegram-bot-api';
import Database from 'better-sqlite3';
import path from 'path';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_ID = process.env.TELEGRAM_ADMIN_ID!;

if (!TOKEN || !ADMIN_ID) {
    console.error('❌ TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_ID not set in .env');
    process.exit(1);
}

// Connect to SQLite database directly
const dbPath = path.resolve(__dirname, '..', 'dev.db');
const db = new Database(dbPath, { readonly: true });

const bot = new TelegramBot(TOKEN, { polling: true });

console.log('🤖 Telegram бот запущено...');

// ═══════════════════════════════════════════════════
// Main Menu
// ═══════════════════════════════════════════════════

function getMainMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📦 Замовлення', callback_data: 'orders' },
                    { text: '📩 Повідомлення', callback_data: 'notifications' },
                ],
                [
                    { text: '📊 Статистика', callback_data: 'stats' },
                    { text: '⚙️ Статус сайту', callback_data: 'site_status' },
                ],
            ],
        },
        parse_mode: 'HTML' as const,
    };
}

// ═══════════════════════════════════════════════════
// /start command
// ═══════════════════════════════════════════════════

bot.onText(/\/start/, (msg) => {
    if (String(msg.chat.id) !== ADMIN_ID) {
        bot.sendMessage(msg.chat.id, '⛔ Доступ заборонено.');
        return;
    }

    const text = `
🏠 <b>SM Furniture — Адмін Бот</b>

Вітаю! Я ваш бот-помічник для управління магазином.

Оберіть розділ:`;

    bot.sendMessage(msg.chat.id, text, getMainMenu());
});

// ═══════════════════════════════════════════════════
// /menu command
// ═══════════════════════════════════════════════════

bot.onText(/\/menu/, (msg) => {
    if (String(msg.chat.id) !== ADMIN_ID) return;
    bot.sendMessage(msg.chat.id, '🏠 <b>Головне меню</b>', getMainMenu());
});

// ═══════════════════════════════════════════════════
// Callback handlers (button presses)
// ═══════════════════════════════════════════════════

bot.on('callback_query', async (query) => {
    if (!query.data || String(query.message?.chat.id) !== ADMIN_ID) {
        bot.answerCallbackQuery(query.id, { text: '⛔ Доступ заборонено' });
        return;
    }

    // Answer the callback to remove loading state
    bot.answerCallbackQuery(query.id);

    const chatId = query.message!.chat.id;
    const data = query.data;

    try {
        if (data === 'orders') {
            await showOrders(chatId);
        } else if (data === 'notifications') {
            await showNotifications(chatId);
        } else if (data === 'stats') {
            await showStats(chatId);
        } else if (data === 'site_status') {
            await showSiteStatus(chatId);
        } else if (data === 'back_menu') {
            await bot.sendMessage(chatId, '🏠 <b>Головне меню</b>', getMainMenu());
        } else if (data.startsWith('order_')) {
            await showOrderDetail(chatId, data.replace('order_', ''));
        } else if (data.startsWith('notif_')) {
            await showNotificationDetail(chatId, data.replace('notif_', ''));
        } else if (data.startsWith('mark_read_')) {
            await markNotificationRead(chatId, data.replace('mark_read_', ''));
        } else if (data === 'orders_all') {
            await showOrders(chatId, 'all');
        } else if (data === 'orders_pending') {
            await showOrders(chatId, 'pending');
        } else if (data === 'notif_unread') {
            await showNotifications(chatId, 'unread');
        } else if (data === 'notif_all') {
            await showNotifications(chatId, 'all');
        }
    } catch (error) {
        console.error('Callback error:', error);
        bot.sendMessage(chatId, '❌ Виникла помилка. Спробуйте ще раз.');
    }
});

// ═══════════════════════════════════════════════════
// Orders Section
// ═══════════════════════════════════════════════════

async function showOrders(chatId: number, filter: string = 'pending') {
    let query = 'SELECT * FROM "Order" ORDER BY createdAt DESC LIMIT 10';
    if (filter === 'pending') {
        query = 'SELECT * FROM "Order" WHERE status = \'pending\' ORDER BY createdAt DESC LIMIT 10';
    }

    const orders = db.prepare(query).all() as any[];
    const totalPending = (db.prepare('SELECT COUNT(*) as cnt FROM "Order" WHERE status = \'pending\'').get() as any).cnt;

    if (orders.length === 0) {
        const text = filter === 'pending'
            ? '✅ Немає нових замовлень!'
            : '📦 Замовлень поки немає.';
        await bot.sendMessage(chatId, text, {
            reply_markup: {
                inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'back_menu' }]],
            },
        });
        return;
    }

    let text = `📦 <b>Замовлення</b> ${filter === 'pending' ? `(нові: ${totalPending})` : '(всі)'}\n\n`;

    orders.forEach((order, i) => {
        const date = new Date(order.createdAt).toLocaleDateString('uk-UA', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        });
        const statusEmoji = order.status === 'pending' ? '🟡' : order.status === 'confirmed' ? '🟢' : '✅';
        text += `${statusEmoji} <b>#${order.id.slice(-6)}</b> — ${order.firstName} ${order.lastName}\n`;
        text += `   💰 ${order.total} ₴ | 📅 ${date}\n\n`;
    });

    const buttons: TelegramBot.InlineKeyboardButton[][] = [];

    // Order detail buttons (max 5)
    const detailButtons = orders.slice(0, 5).map(o => ({
        text: `#${o.id.slice(-6)}`,
        callback_data: `order_${o.id}`,
    }));
    if (detailButtons.length > 0) buttons.push(detailButtons);

    // Filter buttons
    buttons.push([
        { text: filter === 'pending' ? '📦 Всі замовлення' : '🟡 Тільки нові', callback_data: filter === 'pending' ? 'orders_all' : 'orders_pending' },
    ]);
    buttons.push([{ text: '◀️ Назад', callback_data: 'back_menu' }]);

    await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
    });
}

async function showOrderDetail(chatId: number, orderId: string) {
    const order = db.prepare('SELECT * FROM "Order" WHERE id = ?').get(orderId) as any;
    if (!order) {
        await bot.sendMessage(chatId, '❌ Замовлення не знайдено');
        return;
    }

    const items = db.prepare(`
        SELECT oi.*, p.name as productName 
        FROM "OrderItem" oi 
        JOIN "Product" p ON oi.productId = p.id 
        WHERE oi.orderId = ?
    `).all(orderId) as any[];

    const date = new Date(order.createdAt).toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const statusMap: Record<string, string> = {
        pending: '🟡 Нове',
        confirmed: '🟢 Підтверджено',
        shipped: '🚚 Відправлено',
        delivered: '✅ Доставлено',
        cancelled: '❌ Скасовано',
    };

    let text = `📦 <b>Замовлення #${order.id.slice(-6)}</b>\n`;
    text += `📅 ${date}\n`;
    text += `${statusMap[order.status] || order.status}\n\n`;
    text += `👤 <b>Клієнт:</b> ${order.firstName} ${order.lastName}\n`;
    text += `📱 <b>Телефон:</b> ${order.phone}\n`;
    text += `📧 <b>Email:</b> ${order.email || '—'}\n\n`;
    text += `🚚 <b>Доставка:</b> ${order.deliveryMethod}\n`;
    text += `🏙 <b>Місто:</b> ${order.city || '—'}\n`;
    text += `📍 <b>Адреса/Відділення:</b> ${order.branch || order.address || '—'}\n`;
    text += `💳 <b>Оплата:</b> ${order.paymentMethod}\n\n`;
    text += `<b>Товари:</b>\n`;

    items.forEach((item) => {
        text += `  • ${item.productName} × ${item.quantity} — ${item.price * item.quantity} ₴\n`;
    });

    text += `\n<b>💰 Всього: ${order.total} ₴</b>`;

    await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '◀️ До замовлень', callback_data: 'orders' }],
                [{ text: '🏠 Головне меню', callback_data: 'back_menu' }],
            ],
        },
    });
}

// ═══════════════════════════════════════════════════
// Notifications Section (Contact Messages)
// ═══════════════════════════════════════════════════

async function showNotifications(chatId: number, filter: string = 'unread') {
    let query = 'SELECT * FROM "ContactMessage" ORDER BY createdAt DESC LIMIT 15';
    if (filter === 'unread') {
        query = 'SELECT * FROM "ContactMessage" WHERE read = 0 ORDER BY createdAt DESC LIMIT 15';
    }

    const messages = db.prepare(query).all() as any[];
    const unreadCount = (db.prepare('SELECT COUNT(*) as cnt FROM "ContactMessage" WHERE read = 0').get() as any).cnt;
    const totalCount = (db.prepare('SELECT COUNT(*) as cnt FROM "ContactMessage"').get() as any).cnt;

    if (messages.length === 0) {
        const text = filter === 'unread'
            ? '✅ Немає непрочитаних повідомлень!'
            : '📩 Повідомлень поки немає.';
        await bot.sendMessage(chatId, text, {
            reply_markup: {
                inline_keyboard: [
                    filter === 'unread' && totalCount > 0
                        ? [{ text: '📩 Показати всі', callback_data: 'notif_all' }]
                        : [],
                    [{ text: '◀️ Назад', callback_data: 'back_menu' }],
                ].filter(r => r.length > 0),
            },
        });
        return;
    }

    let text = `📩 <b>Повідомлення</b> ${filter === 'unread' ? `(непрочитані: ${unreadCount})` : `(всього: ${totalCount})`}\n\n`;

    messages.forEach((msg) => {
        const date = new Date(msg.createdAt).toLocaleDateString('uk-UA', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        });
        const readIcon = msg.read ? '📖' : '🔵';
        const msgPreview = msg.message.length > 60 ? msg.message.slice(0, 60) + '...' : msg.message;
        text += `${readIcon} <b>${msg.name}</b> (${date})\n`;
        text += `   ${msgPreview}\n\n`;
    });

    const buttons: TelegramBot.InlineKeyboardButton[][] = [];

    // Detail buttons (max 5)
    const detailButtons = messages.slice(0, 5).map(m => ({
        text: `${m.read ? '📖' : '🔵'} ${m.name.slice(0, 12)}`,
        callback_data: `notif_${m.id}`,
    }));
    if (detailButtons.length > 0) buttons.push(detailButtons);

    // Filter toggle
    buttons.push([
        { text: filter === 'unread' ? '📩 Показати всі' : '🔵 Тільки непрочитані', callback_data: filter === 'unread' ? 'notif_all' : 'notif_unread' },
    ]);
    buttons.push([{ text: '◀️ Назад', callback_data: 'back_menu' }]);

    await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
    });
}

async function showNotificationDetail(chatId: number, msgId: string) {
    const msg = db.prepare('SELECT * FROM "ContactMessage" WHERE id = ?').get(msgId) as any;
    if (!msg) {
        await bot.sendMessage(chatId, '❌ Повідомлення не знайдено');
        return;
    }

    const date = new Date(msg.createdAt).toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    let text = `📩 <b>Повідомлення</b>\n\n`;
    text += `👤 <b>Від:</b> ${msg.name}\n`;
    text += `📧 <b>Email:</b> ${msg.email}\n`;
    text += `📅 <b>Дата:</b> ${date}\n`;
    text += `📌 <b>Статус:</b> ${msg.read ? 'Прочитане' : 'Непрочитане'}\n\n`;
    text += `<b>Повідомлення:</b>\n${msg.message}`;

    await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                !msg.read ? [{ text: '✅ Позначити як прочитане', callback_data: `mark_read_${msg.id}` }] : [],
                [{ text: '◀️ До повідомлень', callback_data: 'notifications' }],
                [{ text: '🏠 Головне меню', callback_data: 'back_menu' }],
            ].filter(r => r.length > 0),
        },
    });
}

async function markNotificationRead(chatId: number, msgId: string) {
    // Need write access for this operation
    const writableDb = new Database(dbPath);
    writableDb.prepare('UPDATE "ContactMessage" SET read = 1 WHERE id = ?').run(msgId);
    writableDb.close();

    await bot.sendMessage(chatId, '✅ Повідомлення позначено як прочитане!', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📩 До повідомлень', callback_data: 'notifications' }],
                [{ text: '🏠 Головне меню', callback_data: 'back_menu' }],
            ],
        },
    });
}

// ═══════════════════════════════════════════════════
// Stats Section
// ═══════════════════════════════════════════════════

async function showStats(chatId: number) {
    const totalProducts = (db.prepare('SELECT COUNT(*) as cnt FROM "Product"').get() as any).cnt;
    const totalOrders = (db.prepare('SELECT COUNT(*) as cnt FROM "Order"').get() as any).cnt;
    const pendingOrders = (db.prepare('SELECT COUNT(*) as cnt FROM "Order" WHERE status = \'pending\'').get() as any).cnt;
    const totalRevenue = (db.prepare('SELECT COALESCE(SUM(total), 0) as sum FROM "Order"').get() as any).sum;
    const totalMessages = (db.prepare('SELECT COUNT(*) as cnt FROM "ContactMessage"').get() as any).cnt;
    const unreadMessages = (db.prepare('SELECT COUNT(*) as cnt FROM "ContactMessage" WHERE read = 0').get() as any).cnt;
    const totalUsers = (db.prepare('SELECT COUNT(*) as cnt FROM "User"').get() as any).cnt;
    const totalCollections = (db.prepare('SELECT COUNT(*) as cnt FROM "Collection"').get() as any).cnt;

    const text = `📊 <b>Статистика магазину</b>

🛒 <b>Товари:</b> ${totalProducts}
📚 <b>Колекції:</b> ${totalCollections}
👥 <b>Користувачі:</b> ${totalUsers}

📦 <b>Замовлення:</b> ${totalOrders}
🟡 <b>Нових:</b> ${pendingOrders}
💰 <b>Загальний дохід:</b> ${totalRevenue.toLocaleString('uk-UA')} ₴

📩 <b>Повідомлення:</b> ${totalMessages}
🔵 <b>Непрочитаних:</b> ${unreadMessages}`;

    await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '◀️ Назад', callback_data: 'back_menu' }],
            ],
        },
    });
}

// ═══════════════════════════════════════════════════
// Site Status
// ═══════════════════════════════════════════════════

async function showSiteStatus(chatId: number) {
    let siteOk = false;
    try {
        const res = await fetch('http://localhost:3001');
        siteOk = res.ok;
    } catch {
        siteOk = false;
    }

    const text = `⚙️ <b>Статус сайту</b>

🌐 <b>URL:</b> http://localhost:3001
${siteOk ? '✅ Сайт працює' : '❌ Сайт недоступний'}

🤖 <b>Бот:</b> ✅ Активний
📅 <b>Час:</b> ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })}`;

    await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '◀️ Назад', callback_data: 'back_menu' }],
            ],
        },
    });
}

// ═══════════════════════════════════════════════════
// Set bot commands menu
// ═══════════════════════════════════════════════════

bot.setMyCommands([
    { command: 'start', description: '🏠 Головне меню' },
    { command: 'menu', description: '📋 Показати меню' },
]);

// Handle errors
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
});

console.log('✅ Бот готовий! Надішліть /start в Telegram.');
