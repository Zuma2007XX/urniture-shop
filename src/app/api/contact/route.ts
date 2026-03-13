import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendTelegramMessage, escapeHtml } from '@/lib/telegram';

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
        const text = `
📩 <b>Нове повідомлення з сайту!</b>

👤 <b>Ім'я:</b> ${escapeHtml(name)}
📧 <b>Email:</b> ${escapeHtml(email)}

💬 <b>Повідомлення:</b>
${escapeHtml(message)}

🕐 ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })}
`;

        await sendTelegramMessage(text, 'HTML');

        return NextResponse.json({ success: true, id: contactMessage.id });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Помилка при відправці повідомлення' },
            { status: 500 }
        );
    }
}

