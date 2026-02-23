import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Checking products...");
    const products = await prisma.product.findMany({
        where: {
            collection: {
                title: { contains: 'Лайт' }
            }
        },
        take: 3
    });

    for (const p of products) {
        let images = JSON.parse(p.images as string) as string[];
        console.log(`\nProduct: ${p.name}`);

        if (images.length === 0) continue;

        // e.g. https://everestmebli.com.ua/storage/products/4/1734/11111_01.jpeg
        const firstImgFolder = images[0].split('/').slice(0, 6).join('/'); // "https://everestmebli.com.ua/storage/products/4/1734"
        console.log(`Target folder: ${firstImgFolder}`);

        const filtered = images.filter(img => img.startsWith(firstImgFolder));
        const removed = images.filter(img => !img.startsWith(firstImgFolder));

        console.log(`Kept (${filtered.length}):`, filtered);
        console.log(`Removed (${removed.length}):`, removed);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
