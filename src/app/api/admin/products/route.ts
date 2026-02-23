import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await req.json();
        const product = await prisma.product.create({
            data: {
                name: data.name,
                sku: data.sku || null,
                description: data.description || '',
                price: parseFloat(data.price),
                images: data.images || '[]',
                category: data.category || '',
                stock: parseInt(data.stock) || 0,
                series: data.series || null,
                badge: data.badge || null,
                material: data.material || null,
                frame: data.frame || null,
                upholstery: data.upholstery || null,
                loadLimit: data.loadLimit || null,
                assembly: data.assembly || null,
                recyclability: data.recyclability || null,
                warranty: data.warranty || null,
                concept: data.concept || null,
                collectionId: data.collectionId || null,
                specifications: data.specifications ? JSON.stringify(data.specifications) : null,
            },
        });
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Failed to create product:', error);
        return NextResponse.json(
            { error: `Failed to create product: ${(error as Error).message}` },
            { status: 500 }
        );
    }
}
