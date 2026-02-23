import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const count = await prisma.product.count();
        console.log('Product count:', count);

        if (count > 0) {
            const first = await prisma.product.findFirst();
            console.log('First product:', first);
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
