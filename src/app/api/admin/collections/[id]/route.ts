import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const collection = await prisma.collection.findUnique({
            where: { id },
        });
        if (!collection) {
            return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
        }
        return NextResponse.json(collection);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, slug, description, image } = body;

        const collection = await prisma.collection.update({
            where: { id },
            data: {
                title,
                slug,
                description,
                image,
                products: body.products ? {
                    set: body.products.map((id: string) => ({ id })),
                } : undefined,
            },
            include: {
                products: true, // Return updated products to confirm
            },
        });
        return NextResponse.json(collection);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.collection.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
    }
}
