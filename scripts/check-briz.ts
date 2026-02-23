
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Checking Categories...');
    const categories = await prisma.category.findMany({
        where: { name: { contains: 'Briz' } } // or 'Бріз'
    });
    console.log('Categories found:', categories);

    console.log('Checking Collections...');
    const collections = await prisma.collection.findMany({
        where: { title: { contains: 'Briz' } }
    });
    console.log('Collections found:', collections);

    // Also check products to see if they are just loosely named
    const products = await prisma.product.findMany({
        where: { name: { contains: 'Бріз' } },
        take: 5
    });
    console.log('Existing products sample:', products.length);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
