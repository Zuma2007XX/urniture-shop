
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    const names = [
        "Щит вішалка EVEREST Соната 800 Сонома 800x150x400 мм",
        "Щит вішалка EVEREST Соната 800 Дуб крафт білий 800x150x400 мм",
        "Шафа EVEREST Соната 800x496x2050 мм Сонома + Білий"
    ];

    const products = await prisma.product.findMany({
        where: {
            name: { in: names }
        },
        select: { id: true, name: true, sku: true }
    });

    console.log('Found products:', products);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
