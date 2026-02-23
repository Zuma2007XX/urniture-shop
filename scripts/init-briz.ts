
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Create "Бріз" collection if not exists
    const collection = await prisma.collection.upsert({
        where: { slug: 'briz' },
        update: {},
        create: {
            title: 'Бріз',
            slug: 'briz',
            description: 'Колекція меблів Бріз',
            image: '/uploads/briz-collection.jpg' // Placeholder
        }
    });
    console.log('Collection ensured:', collection);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
