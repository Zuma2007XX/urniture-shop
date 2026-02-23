import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const collections = await prisma.collection.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { products: true } } }
        });
        return NextResponse.json(collections);
    } catch (error) {
        console.error('Failed to fetch collections:', error);
        return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, slug, description, image } = body;

        const collection = await prisma.collection.create({
            data: {
                title,
                slug,
                description,
                image,
            },
        });
        return NextResponse.json(collection);
    } catch (error) {
        console.error('Failed to create collection:', error);
        return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
    }
}
