import prisma from '../src/lib/prisma';

async function main() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log("Recent orders:", orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        userId: o.userId,
        createdAt: o.createdAt
    })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
