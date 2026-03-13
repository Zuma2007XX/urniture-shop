import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- SEARCHING FOR TEST LABELS ---');
    const products: any[] = await prisma.$queryRawUnsafe(`SELECT id, name, description FROM Product WHERE description LIKE '%ВЕРСІЯ SeriousM%'`);

    console.log(`Found ${products.length} products with test label.`);
    products.forEach(p => {
        console.log(`ID: ${p.id} | Name: ${p.name}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
