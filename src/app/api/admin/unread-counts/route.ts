import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [unreadOrders, unreadMessages] = await Promise.all([
        prisma.order.count({ where: { read: false } }),
        prisma.contactMessage.count({ where: { read: false } })
    ]);

    return NextResponse.json({
        orders: unreadOrders,
        messages: unreadMessages
    });
}
