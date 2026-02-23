import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Fetching Light series products...");
    const products = await prisma.product.findMany({
        where: {
            collection: {
                title: { contains: 'Лайт' }
            }
        }
    });

    console.log(`Found ${products.length} products.`);

    let updatedCount = 0;

    for (const p of products) {
        if (!p.images) continue;

        let images: string[] = [];
        try {
            images = JSON.parse(p.images);
        } catch (e) {
            continue;
        }

        if (images.length === 0) continue;

        // e.g. https://everestmebli.com.ua/storage/products/4/1734/11111_01.jpeg
        const firstImgFolder = images[0].split('/').slice(0, 6).join('/');

        const filtered = images.filter(img => img.startsWith(firstImgFolder));

        if (filtered.length !== images.length) {
            console.log(`Updating ${p.name}: ${images.length} -> ${filtered.length} images`);

            await prisma.product.update({
                where: { id: p.id },
                data: {
                    images: JSON.stringify(filtered)
                }
            });
            updatedCount++;
        }
    }

    console.log(`Done. Updated ${updatedCount} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
