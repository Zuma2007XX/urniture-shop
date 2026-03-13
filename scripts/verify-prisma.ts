import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- PRISMA QUERY CHECK ---');
    try {
        const products = await prisma.product.findMany({
            take: 5,
            select: { id: true, name: true, isActive: true }
        });
        console.log('Successfully fetched products via Prisma:');
        products.forEach(p => console.log(` - ${p.name} (isActive: ${p.isActive})`));
        console.log('SITE SHOULD BE WORKING NOW.');
    } catch (e: any) {
        console.error('Prisma query still failing:', e.message);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
