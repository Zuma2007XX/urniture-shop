import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

// GET all new arrival product IDs
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { isNew: true },
            select: { id: true },
        });
        return NextResponse.json(products.map((p: { id: string }) => p.id));
    } catch (error) {
        console.error('Failed to fetch new arrival products:', error);
        return NextResponse.json({ error: 'Failed to fetch new arrival products' }, { status: 500 });
    }
}

// PUT - update the set of new arrival products
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const data = await request.json();
        const productIds = data.productIds as string[];

        // Unmark all first
        await prisma.product.updateMany({
            where: { isNew: true },
            data: { isNew: false },
        });

        // Mark selected as new
        if (productIds.length > 0) {
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: { isNew: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update new arrival products:', error);
        return NextResponse.json({ error: 'Failed to update new arrival products' }, { status: 500 });
    }
}
