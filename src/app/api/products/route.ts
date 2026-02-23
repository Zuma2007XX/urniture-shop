import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { SEARCH_TRANSLATIONS } from '@/lib/search-dictionary';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const series = searchParams.get('series');

    try {
        const where: any = {};
        if (category && category !== 'all') where.category = category;
        if (series) {
            if (series.includes(',')) {
                where.series = { in: series.split(',') };
            } else {
                where.series = series;
            }
        }

        const search = searchParams.get('search');
        if (search) {
            const searchLower = search.toLowerCase();
            const searchCap = searchLower.charAt(0).toUpperCase() + searchLower.slice(1);
            const searchUpper = search.toUpperCase();

            // Base conditions for original term
            const orConditions: any[] = [
                { name: { contains: search } },
                { description: { contains: search } },
                { series: { contains: search } },
                { category: { contains: search } },
                { name: { contains: searchLower } },
                { description: { contains: searchLower } },
                { name: { contains: searchCap } },
                { description: { contains: searchCap } },
                { category: { contains: searchCap } },
                { name: { contains: searchUpper } },
            ];

            // Add translation conditions
            const translations = SEARCH_TRANSLATIONS[searchLower];
            if (translations) {
                translations.forEach(trans => {
                    const transLower = trans.toLowerCase();
                    const transCap = transLower.charAt(0).toUpperCase() + transLower.slice(1);
                    const transUpper = trans.toUpperCase();

                    orConditions.push(
                        { name: { contains: trans } },
                        { description: { contains: trans } },
                        { category: { contains: trans } },
                        { series: { contains: trans } },
                        { name: { contains: transLower } },
                        { description: { contains: transLower } },
                        { name: { contains: transCap } },
                        { description: { contains: transCap } },
                        { category: { contains: transCap } },
                        { name: { contains: transUpper } }
                    );
                });
            }

            where.OR = orConditions;
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
