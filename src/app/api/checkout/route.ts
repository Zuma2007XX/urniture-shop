import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendTelegramMessage, escapeHtml } from '@/lib/telegram';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createMonobankInvoice } from '@/lib/api/monobank';
import { generateLiqPayDataAndSignature } from '@/lib/api/liqpay';
import { pushOrderTo1C } from '@/lib/api/one-c';

function generateOrderNumber(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
            firstName, lastName, phone, email, items, total, userId, 
            city, cityRef, deliveryService, deliveryType, branch, branchRef, address, 
            paymentMethod 
        } = body;

        if (!firstName || !lastName || !phone || !items || !items.length) {
            return NextResponse.json({ message: 'Будь ласка, заповніть обов\'язкові поля' }, { status: 400 });
        }

        const orderNumber = generateOrderNumber();
        const session = await getServerSession(authOptions);
        const validUserId = session?.user?.id || undefined;

        // Create the order in DB
        const order = await prisma.order.create({
            data: {
                userId: validUserId,
                firstName,
                lastName,
                phone,
                email: email || '',
                orderNumber: orderNumber,
                deliveryMethod: `${deliveryService === 'nova-poshta' ? 'Нова Пошта' : 'Міст Експрес'} (${deliveryType === 'branch' ? 'Відділення' : 'Адреса'})`,
                city: city || '',
                branch: branch || '',
                address: address || '',
                paymentMethod: paymentMethod,
                total: Number(total) || 0,
                status: 'pending',
                items: {
                    create: items.map((item: any) => ({
                        productId: item.id || item.productId,
                        quantity: Number(item.quantity) || 1,
                        price: Number(item.price) || 0,
                        colorName: item.colorName || item.color || null,
                    }))
                }
            },
            include: {
                items: { include: { product: { select: { name: true, sku: true } } } }
            }
        });

        // 1. Export to 1C (Background/Placeholder)
        try {
            await pushOrderTo1C({
                orderNumber,
                clientName: `${firstName} ${lastName}`,
                clientPhone: phone,
                items: items.map((i: any) => ({ sku: i.sku || 'N/A', qty: i.quantity, price: i.price }))
            });
        } catch (e) {
            console.error('1C Export failed:', e);
        }

        // 2. Handle Payment Gateways
        let checkoutUrl = null;

        if (paymentMethod === 'monobank') {
            const monoResponse = await createMonobankInvoice({
                amount: total,
                orderId: order.id,
                orderNumber: orderNumber,
                items: items.map((i: any) => ({ name: i.name, qty: i.quantity, sum: i.price })),
                redirectUrl: `${process.env.NEXTAUTH_URL}/checkout/success?order=${orderNumber}`
            });
            checkoutUrl = monoResponse.pageUrl;
        } else if (paymentMethod === 'privatpay') {
            const { data, signature } = generateLiqPayDataAndSignature({
                public_key: process.env.LIQPAY_PUBLIC_KEY || '',
                version: 3,
                action: 'pay',
                amount: total,
                currency: 'UAH',
                description: `Оплата замовлення #${orderNumber}`,
                order_id: orderNumber,
                result_url: `${process.env.NEXTAUTH_URL}/checkout/success?order=${orderNumber}`,
                server_url: process.env.LIQPAY_CALLBACK_URL || '',
                paytypes: 'privatpay' // Force PrivatPay method
            } as any, process.env.LIQPAY_PRIVATE_KEY || '');
            
            checkoutUrl = `https://www.liqpay.ua/api/3/checkout?data=${data}&signature=${signature}`;
        } else if (paymentMethod === 'liqpay') {
            const { data, signature } = generateLiqPayDataAndSignature({
                public_key: process.env.LIQPAY_PUBLIC_KEY || '',
                version: 3,
                action: 'pay',
                amount: total,
                currency: 'UAH',
                description: `Оплата замовлення #${orderNumber}`,
                order_id: orderNumber,
                result_url: `${process.env.NEXTAUTH_URL}/checkout/success?order=${orderNumber}`,
                server_url: process.env.LIQPAY_CALLBACK_URL || ''
            }, process.env.LIQPAY_PRIVATE_KEY || '');
            
            checkoutUrl = `https://www.liqpay.ua/api/3/checkout?data=${data}&signature=${signature}`;
        }

        // 3. Send Telegram Notification
        try {
            const itemsList = order.items.map((item: any) => 
                `• ${escapeHtml(item.product?.name || '—')} — ${item.quantity} шт. × ${item.price} ₴`
            ).join('\n');

            const message = `
<b>🛒 НОВЕ ЗАМОВЛЕННЯ #${escapeHtml(orderNumber)}</b>

<b>Клієнт:</b> ${escapeHtml(firstName)} ${escapeHtml(lastName)}
<b>Телефон:</b> ${escapeHtml(phone)}
<b>Доставка:</b> ${escapeHtml(order.deliveryMethod)}: ${escapeHtml(city)}, ${escapeHtml(branch || address)}
<b>Оплата:</b> ${escapeHtml(paymentMethod)}
<b>Сума:</b> ${order.total.toLocaleString()} ₴

<b>Товари:</b>
${itemsList}
`;
            await sendTelegramMessage(message, 'HTML');
        } catch (tgError) {
            console.error('Telegram failed:', tgError);
        }

        return NextResponse.json(
            { message: 'Order created', orderNumber, checkoutUrl },
            { status: 201 }
        );

    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
