
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    const countWithSku = await prisma.product.count({
        where: {
            sku: { not: null }
        }
    });
    console.log(`Products with SKU: ${countWithSku}`);

    const sample = await prisma.product.findMany({
        where: { sku: { not: null } },
        take: 5,
        select: { name: true, sku: true }
    });
    console.log('Sample:', sample);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
