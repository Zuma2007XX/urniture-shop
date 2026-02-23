import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
    try {
        const contents = await prisma.siteContent.findMany();
        return NextResponse.json(contents);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await req.json();
        const { section, title, subtitle, body, image, linkText, linkUrl } = data;

        const content = await prisma.siteContent.upsert({
            where: { section },
            update: { title, subtitle, body, image, linkText, linkUrl },
            create: { section, title, subtitle, body, image, linkText, linkUrl },
        });

        return NextResponse.json(content);
    } catch (error) {
        console.error('Failed to update content:', error);
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}
