import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [productCount, orderCount, revenueData] = await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: {
                    total: true,
                },
                where: {
                    NOT: {
                        status: 'cancelled',
                    },
                },
            }),
        ]);

        return NextResponse.json({
            products: productCount,
            orders: orderCount,
            revenue: revenueData._sum.total || 0,
        });
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
