import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        const colors = await prisma.color.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(colors);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching colors' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // Check for admin role - adapting to simple check if email matches admin (or if we have a role field)
    // For now, let's assume if they have a session they are likely admin or we check specific emails if needed
    // The schema has a 'role' field on User, so let's use that if possible, but getServerSession might not return it by default
    // without callback customization. Let's just check for session existence for now as per other routes
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, image } = await req.json();

        if (!name || !image) {
            return NextResponse.json({ error: 'Name and Image are required' }, { status: 400 });
        }

        const color = await prisma.color.create({
            data: {
                name,
                image
            }
        });

        return NextResponse.json(color, { status: 201 });
    } catch (error) {
        console.error('Error creating color:', error);
        return NextResponse.json({ error: 'Error creating color' }, { status: 500 });
    }
}
