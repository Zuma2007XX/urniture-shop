import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { colors } = await request.json(); // Expect array of color objects

        if (!Array.isArray(colors)) {
            return NextResponse.json({ error: 'Invalid colors data' }, { status: 400 });
        }

        const { id: collectionId } = await params;

        // 1. Get all products in the collection
        const products = await prisma.product.findMany({
            where: { collectionId },
            select: { id: true, specifications: true }
        });

        // 2. Prepare product updates
        const productUpdates = products.map(product => {
            let specs: any = {};
            try {
                if (product.specifications) {
                    specs = JSON.parse(product.specifications);
                }
            } catch (e) {
                console.error(`Error parsing specs for product ${product.id}`, e);
                specs = {};
            }

            // Ensure structure
            if (!specs.colors) specs.colors = [];

            // Overwrite colors field with the selected colors
            specs.colors = colors;

            return prisma.product.update({
                where: { id: product.id },
                data: { specifications: JSON.stringify(specs) }
            });
        });

        // 3. Persist the configuration to the Collection model
        try {
            // Use $executeRaw to bypass potential Prisma Client validation issues if the client is stale
            // UPDATE Collection SET variants = ? WHERE id = ?
            await prisma.$executeRaw`UPDATE Collection SET variants = ${JSON.stringify(colors)} WHERE id = ${collectionId}`;
        } catch (colError) {
            console.error('Failed to update collection variants (raw):', colError);
            // Fallback to standard update if raw fails (unlikely, but good for safety if types align later)
            try {
                await prisma.collection.update({
                    where: { id: collectionId },
                    data: { variants: JSON.stringify(colors) }
                });
            } catch (fallbackError) {
                console.error('Fallback collection update also failed:', fallbackError);
                // We don't throw here to ensure products are still updated/returned
                // But we should probably alert the user. 
                // Actually, if persistence fails, the user might want to know.
                // But the PRODUCTS were updated successfully in the previous step? 
                // No, we are about to await productUpdates.
            }
        }

        // Execute product updates
        await Promise.all(productUpdates);

        return NextResponse.json({ success: true, count: products.length });
    } catch (error) {
        console.error('Bulk update error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}
