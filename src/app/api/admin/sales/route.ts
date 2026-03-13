import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { startOfDay, subDays, endOfDay, format } from 'date-fns';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

        // 1. Get all orders for the last 30 days (excluding cancelled)
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                NOT: { status: 'cancelled' }
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, sku: true, images: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Aggregate Daily Stats
        const dailyStatsMap = new Map();
        // Initialize last 30 days with 0
        for (let i = 0; i <= 30; i++) {
            const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
            dailyStatsMap.set(date, { date, revenue: 0, count: 0, orders: [] });
        }

        orders.forEach(order => {
            const date = format(order.createdAt, 'yyyy-MM-dd');
            if (dailyStatsMap.has(date)) {
                const stat = dailyStatsMap.get(date);
                stat.revenue += order.total;
                stat.count += 1;
                stat.orders.push(order);
            }
        });

        const daily = Array.from(dailyStatsMap.values()).reverse();

        // 3. Aggregate Top Products (All time or last 30 days? Let's do all time for a better "Analytics" feel)
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: { NOT: { status: 'cancelled' } }
            },
            include: {
                product: {
                    select: { name: true, images: true }
                }
            }
        });

        const productStatsMap = new Map();
        orderItems.forEach(item => {
            if (!productStatsMap.has(item.productId)) {
                let productImage = '';
                const itemAny = item as any;
                try {
                    if (itemAny.product?.images) {
                        const parsed = JSON.parse(itemAny.product.images);
                        productImage = Array.isArray(parsed) ? parsed[0] : parsed;
                    }
                } catch (e) {
                    productImage = itemAny.product?.images || '';
                }

                productStatsMap.set(item.productId, {
                    id: item.productId,
                    name: itemAny.product?.name || 'Unknown',
                    image: productImage,
                    quantity: 0,
                    revenue: 0
                });
            }
            const stats = productStatsMap.get(item.productId);
            stats.quantity += item.quantity;
            stats.revenue += item.price * item.quantity;
        });

        const topProducts = Array.from(productStatsMap.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        return NextResponse.json({
            daily,
            topProducts,
            summary: {
                totalRevenue: daily.reduce((acc, curr) => acc + curr.revenue, 0),
                totalOrders: daily.reduce((acc, curr) => acc + curr.count, 0),
                avgOrderValue: daily.reduce((acc, curr) => acc + curr.count, 0) > 0
                    ? daily.reduce((acc, curr) => acc + curr.revenue, 0) / daily.reduce((acc, curr) => acc + curr.count, 0)
                    : 0
            }
        });
    } catch (error) {
        console.error('Sales API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
