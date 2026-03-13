import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- DUPLICATE CHECK FOR ASTORIA-2 ---');

    const products: any[] = await prisma.$queryRawUnsafe(`SELECT id, name, description, sku FROM Product WHERE name LIKE '%Асторія-2%'`);

    console.log(`Found ${products.length} products with that name.`);
    products.forEach(p => {
        console.log(`ID: ${p.id} | SKU: ${p.sku} | Name: ${p.name}`);
        console.log(`  Desc: ${p.description}`);
        console.log('---');
    });

    console.log('\n--- CONNECTION CHECK ---');
    console.log('DATABASE_URL starts with:', process.env.TURSO_DATABASE_URL?.substring(0, 15));
}

main().catch(console.error).finally(() => prisma.$disconnect());
