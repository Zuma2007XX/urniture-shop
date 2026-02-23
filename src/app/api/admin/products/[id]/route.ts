import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { collection: true },
        });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await req.json();
        const product = await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                sku: data.sku || null,
                description: data.description,
                price: parseFloat(data.price),
                images: data.images,
                category: data.category,
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
        return NextResponse.json(product);
    } catch (error) {
        console.error('Failed to update product:', error);
        return NextResponse.json(
            { error: `Failed to update product: ${(error as Error).message}` },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Manually delete related OrderItems first to ensure deletion succeeds
        await prisma.orderItem.deleteMany({
            where: { productId: id },
        });

        await prisma.product.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
