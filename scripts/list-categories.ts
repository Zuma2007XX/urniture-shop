
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    const categories = await prisma.category.findMany();
    console.log(JSON.stringify(categories, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
