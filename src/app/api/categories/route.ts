import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });

        // Compute counts based on the 'category' string field (slug), not 'categoryId' relation
        const productCounts = await prisma.product.groupBy({
            by: ['category'],
            _count: {
                id: true
            }
        });

        const countMap = new Map(productCounts.map(c => [c.category, c._count.id]));

        const categoriesWithCount = categories.map(cat => ({
            ...cat,
            _count: {
                products: countMap.get(cat.slug) || 0
            }
        }));

        return NextResponse.json(categoriesWithCount);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await req.json();

        if (!data.name || !data.slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                name: data.name,
                slug: data.slug,
                image: data.image || null,
            },
        });
        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
        }
        return NextResponse.json(
            { error: `Failed to create category: ${error.message}` },
            { status: 500 }
        );
    }
}
