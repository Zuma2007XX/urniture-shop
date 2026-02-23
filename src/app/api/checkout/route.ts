import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            firstName,
            lastName,
            phone,
            email,
            deliveryMethod,
            city,
            branch,
            address,
            paymentMethod,
            items,
            total,
            userId,
        } = body;

        // Basic validation
        if (!firstName || !lastName || !phone || !email || !deliveryMethod || !paymentMethod || !items || !items.length) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create the order in Prisma
        const order = await prisma.order.create({
            data: {
                userId: userId || undefined,
                firstName,
                lastName,
                phone,
                email,
                deliveryMethod,
                city,
                branch,
                address,
                paymentMethod,
                total,
                status: 'pending', // Default status
                items: {
                    create: items.map((item: any) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // Format and send Telegram Notification
        try {
            const itemsList = order.items.map(item =>
                `- ${item.product.name} (${item.quantity} шт.) х ${item.price} ₴ = ${item.quantity * item.price} ₴`
            ).join('\n');

            const message = `
<b>🛒 НОВЕ ЗАМОВЛЕННЯ #${order.id.slice(-6)}</b>

<b>Клієнт:</b> ${firstName} ${lastName}
<b>Телефон:</b> ${phone}
<b>Email:</b> ${email || 'Не вказано'}

<b>Доставка:</b> ${deliveryMethod}
<b>Місто:</b> ${city || '-'}
<b>Відділення/Адреса:</b> ${branch || address || '-'}
<b>Оплата:</b> ${paymentMethod}

<b>Товари:</b>
${itemsList}

<b>Всього до оплати: ${total} ₴</b>
`;
            await sendTelegramMessage(message, 'HTML');
        } catch (tgError) {
            console.error('Failed to send Telegram notification (non-fatal):', tgError);
        }

        return NextResponse.json(
            { message: 'Order created successfully', orderId: order.id },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { message: 'Failed to create order', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
