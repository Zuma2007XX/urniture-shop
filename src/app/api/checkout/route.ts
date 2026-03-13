import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Generate a unique 6-digit order number
function generateOrderNumber(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, phone, email, items, total, userId, city, branch, address, paymentMethod } = body;

        // Basic validation
        if (!firstName || !lastName || !phone || !items || !items.length) {
            return NextResponse.json(
                { message: 'Будь ласка, заповніть обов\'язкові поля' },
                { status: 400 }
            );
        }

        console.log('[DEBUG CHECKOUT] Received payload:', { firstName, lastName, userId, total, city, paymentMethod });

        const orderNumber = generateOrderNumber();

        // Determine user ID securely from server session
        let validUserId = undefined;
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
            const userRecord = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { id: true },
            });
            if (userRecord) validUserId = session.user.id;
        }

        const productIds = items.map((i: any) => i.id || i.productId);
        const existingProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true }
        });
        const existingProductIds = existingProducts.map(p => p.id);

        const validItems = items.filter((item: any) =>
            existingProductIds.includes(item.id || item.productId)
        );

        if (validItems.length === 0) {
            return NextResponse.json(
                { message: 'Помилка кошика: вибрані товари були видалені з бази даних. Будь ласка, очистіть кошик.' },
                { status: 400 }
            );
        }

        const order = await prisma.order.create({
            data: {
                userId: validUserId,
                firstName,
                lastName,
                phone,
                email: email || '',
                deliveryMethod: branch ? 'Nova Poshta (Department)' : 'Nova Poshta (Address)',
                city: city || '',
                branch: branch || '',
                address: address || '',
                paymentMethod: paymentMethod || 'manager_confirm',
                total: Number(total) || 0,
                status: 'pending',
                items: {
                    create: validItems.map((item: any) => ({
                        productId: item.id || item.productId,
                        quantity: Number(item.quantity) || 1,
                        price: Number(item.price) || 0,
                        colorName: item.colorName || item.color || null,
                    }))
                }
            } as any,
            include: {
                items: {
                    include: { product: { select: { name: true, sku: true } } }
                }
            }
        });

        // Set orderNumber via raw SQL
        await prisma.$executeRawUnsafe(
            `UPDATE "Order" SET "orderNumber" = ? WHERE "id" = ?`,
            orderNumber,
            order.id
        );

        // Send Telegram Notification
        try {
            const itemsList = order.items.map((item: any) => {
                const skuStr = item.product?.sku ? ` (Арт: ${item.product.sku})` : '';
                return `• ${item.product?.name || '—'}${skuStr} — ${item.quantity} шт. × ${item.price} ₴`;
            }).join('\n');

            const paymentDisplay = paymentMethod === 'bank_transfer'
                ? 'На розрахунковий рахунок'
                : 'Післяплата (20грн + 2%)';

            const deliveryDisplay = branch
                ? `Нова Пошта (Відділення): ${city}, №${branch}`
                : `Нова Пошта (Адреса): ${city}, ${address}`;

            const message = `
<b>🛒 НОВА ЗАЯВКА #${orderNumber}</b>

<b>Клієнт:</b> ${firstName} ${lastName}
<b>Телефон:</b> ${phone}
${email ? `<b>Email:</b> ${email}` : ''}

<b>📍 Доставка:</b>
${deliveryDisplay}

<b>💳 Оплата:</b>
${paymentDisplay}

<b>📦 Товари:</b>
${itemsList}

<b>💰 Всього: ${order.total.toLocaleString('uk-UA')} ₴</b>

📱 Номер для менеджера: <b>#${orderNumber}</b>
`;
            await sendTelegramMessage(message, 'HTML');
        } catch (tgError) {
            console.error('Telegram notification failed (non-fatal):', tgError);
        }

        return NextResponse.json(
            { message: 'Order created successfully', orderId: order.id, orderNumber },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating order:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: `Помилка: ${msg}` }, { status: 500 });
    }
}
