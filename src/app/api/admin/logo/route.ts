import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Use PNG, JPG, WebP, or SVG.' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Write directly to public/logo.png
        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        await writeFile(logoPath, buffer);

        const timestamp = Date.now();

        return NextResponse.json({
            success: true,
            timestamp,
            message: 'Logo updated successfully',
        });
    } catch (error) {
        console.error('Logo upload error:', error);
        return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
    }
}
