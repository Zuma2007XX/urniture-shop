import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get('search');

    const orders = await prisma.order.findMany({
        where: search ? {
            OR: [
                { orderNumber: { contains: search } } as any,
                { phone: { contains: search } },
                { firstName: { contains: search } },
                { lastName: { contains: search } }
            ]
        } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: {
                    product: {
                        select: { name: true, sku: true }
                    }
                }
            }
        }
    });

    // WORKAROUND for Next.js dev server stale Prisma cache:
    // Prisma `findMany` omits `orderNumber` from its SELECT statement 
    // because it isn't in the cached generated client types yet. 
    // We manually fetch all orderNumbers via raw SQL and patch the response.
    const rawOrders = await prisma.$queryRawUnsafe<{ id: string, orderNumber: string | null }[]>(
        `SELECT "id", "orderNumber" FROM "Order"`
    );
    const orderNumberMap = new Map(rawOrders.map(o => [o.id, o.orderNumber]));

    const patchedOrders = orders.map((order: any) => ({
        ...order,
        orderNumber: orderNumberMap.get(order.id) || order.orderNumber,
    }));

    return NextResponse.json(patchedOrders);
}
