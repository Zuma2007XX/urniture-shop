
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    const products = await prisma.product.findMany({
        select: { id: true, name: true, category: true, sku: true }
    });
    console.log('Total products:', products.length);
    products.forEach(p => console.log(`[${p.sku || 'NO SKU'}] ${p.name}`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
