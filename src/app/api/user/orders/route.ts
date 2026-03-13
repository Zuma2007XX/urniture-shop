import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: { userId: session.user.id } as any,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                images: true
                            }
                        }
                    }
                }
            }
        });

        // WORKAROUND for Next.js dev server stale Prisma cache:
        // Prisma `findMany` might omit `orderNumber` if it isn't in cached types.
        const rawOrders = await prisma.$queryRawUnsafe<{ id: string, orderNumber: string | null }[]>(
            `SELECT "id", "orderNumber" FROM "Order" WHERE "userId" = ?`,
            session.user.id
        );
        const orderNumberMap = new Map(rawOrders.map(o => [o.id, o.orderNumber]));

        const patchedOrders = orders.map((order: any) => ({
            ...order,
            orderNumber: orderNumberMap.get(order.id) || order.orderNumber,
        }));

        return NextResponse.json(patchedOrders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
