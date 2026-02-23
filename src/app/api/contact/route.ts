import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Будь ласка, заповніть всі поля' },
                { status: 400 }
            );
        }

        // Save to database
        const contactMessage = await prisma.contactMessage.create({
            data: { name, email, message },
        });

        // Send Telegram notification
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_ADMIN_ID;

        if (botToken && chatId) {
            const text = `📩 *Нове повідомлення з сайту!*\n\n👤 *Ім'я:* ${escapeMarkdown(name)}\n📧 *Email:* ${escapeMarkdown(email)}\n\n💬 *Повідомлення:*\n${escapeMarkdown(message)}\n\n🕐 ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })}`;

            try {
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text,
                        parse_mode: 'Markdown',
                    }),
                });
            } catch (tgError) {
                console.error('Telegram notification failed:', tgError);
                // Don't fail the request if Telegram fails
            }
        }

        return NextResponse.json({ success: true, id: contactMessage.id });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Помилка при відправці повідомлення' },
            { status: 500 }
        );
    }
}

function escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}
