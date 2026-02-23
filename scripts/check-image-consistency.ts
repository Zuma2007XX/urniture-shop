import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    const products = await prisma.product.findMany({
        where: {
            name: { contains: 'Асторія' }
        },
        select: {
            name: true,
            images: true
        }
    });

    console.log(`Found ${products.length} products...`);

    for (const p of products) {
        try {
            const images = JSON.parse(p.images);
            console.log(`\nProduct: ${p.name}`);
            images.forEach((url: string, i: number) => {
                const isPng = url.toLowerCase().endsWith('.png');
                console.log(`  [${i}] ${url} ${isPng ? '(PNG)' : ''}`);
            });
        } catch (e) {
            // ignore parse error
        }
    }
    console.log("\nDone.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
