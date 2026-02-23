import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

// GET all featured product IDs
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { featured: true },
            select: { id: true },
        });
        return NextResponse.json(products.map(p => p.id));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 });
    }
}

// PUT - update the set of featured products
export async function PUT(req: Request) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { productIds } = await req.json() as { productIds: string[] };

        // Unfeatured all first
        await prisma.product.updateMany({
            where: { featured: true },
            data: { featured: false },
        });

        // Then feature the selected ones
        if (productIds.length > 0) {
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: { featured: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update featured products:', error);
        return NextResponse.json({ error: 'Failed to update featured products' }, { status: 500 });
    }
}
