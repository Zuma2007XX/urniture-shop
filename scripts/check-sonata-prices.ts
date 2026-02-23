
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    const products = await prisma.product.findMany({
        where: {
            name: { contains: 'Соната' }
        },
        select: { id: true, name: true, price: true }
    });

    console.log(`Total Sonata products: ${products.length}`);

    const unpriced = products.filter(p => p.price === 0);
    console.log(`Unpriced (0 UAH): ${unpriced.length}`);

    unpriced.forEach(p => console.log(`[0 UAH] ${p.name}`));

    // Also verify some named ones
    const priced = products.filter(p => p.price > 0);
    console.log(`Priced: ${priced.length}`);
    if (priced.length > 0) {
        console.log('Sample priced:', priced[0]);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
