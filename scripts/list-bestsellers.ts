import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Mimic the logic in page.tsx
    let featuredProducts = await prisma.product.findMany({
        where: { featured: true },
        orderBy: { createdAt: 'desc' },
    });

    if (featuredProducts.length === 0) {
        console.log("No featured products, falling back to latest 4");
        featuredProducts = await prisma.product.findMany({
            take: 4,
            orderBy: { createdAt: 'desc' },
        });
    }

    console.log(`Found ${featuredProducts.length} featured products.`);

    for (const p of featuredProducts) {
        console.log(`\nProduct: ${p.name}`);
        console.log(`SKU: ${p.sku}`);
        const images = JSON.parse(p.images || '[]');
        console.log(`Images (${images.length}):`);
        images.forEach((img: string, i: number) => console.log(`  [${i}] ${img}`));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
