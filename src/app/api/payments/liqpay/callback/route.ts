import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyLiqPaySignature, decodeLiqPayData } from '@/lib/api/liqpay';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const data = formData.get('data') as string;
        const signature = formData.get('signature') as string;

        if (!verifyLiqPaySignature(data, signature, process.env.LIQPAY_PRIVATE_KEY || '')) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const decodedData = decodeLiqPayData(data);
        const { order_id, status } = decodedData;

        console.log(`[LIQPAY CALLBACK] Order ${order_id}, Status ${status}`);

        if (status === 'success' || status === 'sandbox') {
            await prisma.order.update({
                where: { orderNumber: order_id },
                data: { status: 'paid' }
            });
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('LiqPay Callback Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
