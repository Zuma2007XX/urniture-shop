import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkMonobankPaymentStatus } from '@/lib/api/monobank';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { invoiceId, status, reference } = body;

        console.log(`[MONOBANK CALLBACK] Order ${reference}, Invoice ${invoiceId}, Status ${status}`);

        // Security check: Verify status with Monobank API directly
        const actualStatus = await checkMonobankPaymentStatus(invoiceId);
        
        if (actualStatus.status === 'success') {
            // Update order status in DB
            await prisma.order.update({
                where: { orderNumber: reference },
                data: { status: 'paid' }
            });
            
            console.log(`[MONOBANK CALLBACK] Order ${reference} marked as PAID`);
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Monobank Callback Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
