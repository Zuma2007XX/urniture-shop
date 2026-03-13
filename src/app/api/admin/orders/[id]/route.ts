import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, read } = await req.json();
    const { id } = await params;

    const order = await prisma.order.update({
        where: { id },
        data: {
            ...(status !== undefined && { status }),
            ...(read !== undefined && { read })
        }
    });

    return NextResponse.json(order);
}
