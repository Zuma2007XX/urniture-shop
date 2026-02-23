import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';



export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const body = await req.json();

        // Check if slug changed
        const existingCategory = await prisma.category.findUnique({
            where: { id },
            select: { slug: true }
        });

        if (!existingCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Prepare update data
        const updateData: any = {
            name: body.name,
            image: body.image,
        };

        if (body.slug && body.slug !== existingCategory.slug) {
            updateData.slug = body.slug;
        }

        const category = await prisma.category.update({
            where: { id },
            data: updateData,
        });

        // If slug changed, update linked products' legacy category field
        if (body.slug && body.slug !== existingCategory.slug) {
            await prisma.product.updateMany({
                where: { categoryId: id },
                data: { category: body.slug }
            });
        }

        return NextResponse.json(category);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
        }
        return NextResponse.json(
            { error: `Failed to update category: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        // Optional: Check if products exist?
        // Let's rely on Prisma or just force delete (setting relation to null if optional)
        // If we want to prevent deletion of categories with products:
        /*
        const productCount = await prisma.product.count({ where: { categoryId: id } });
        if (productCount > 0) {
             return NextResponse.json({ error: 'Cannot delete category with products' }, { status: 400 });
        }
        */

        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: `Failed to delete category: ${error.message}` },
            { status: 500 }
        );
    }
}
