
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
// Note: adapter-better-sqlite3 constructor takes { url: string } or Database instance depending on version.
// Let's re-use the working config from migrate-categories.
// Actually migrate-categories used: new PrismaBetterSqlite3({ url: 'file:dev.db' });
// But wait, the app uses: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! })
// So let's try to simulate APP 

const prisma = new PrismaClient({ adapter });

async function main() {
    const count = await prisma.category.count();
    console.log(`Total categories: ${count}`);
    const categories = await prisma.category.findMany();
    console.log('Categories:', categories);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
