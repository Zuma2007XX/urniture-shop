import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    const collections = await prisma.collection.findMany({
        select: {
            id: true,
            title: true
        }
    });

    console.log("Collections:", collections);

    // If we find one that looks like Briz, let's fetch products for it
    const brizCollection = collections.find(c => c.title.toLowerCase().includes('briz') || c.title.toLowerCase().includes('бриз'));

    // Inspect Sonata product
    const product = await prisma.product.findFirst({
        where: {
            name: {
                contains: 'Соната 800'
            }
        },
        select: {
            name: true,
            images: true,
            createdAt: true
        }
    });

    if (product) {
        console.log("Product:", product.name);
        console.log("Created At:", product.createdAt);
        const images = JSON.parse(product.images);
        console.log("Image count:", images.length);
        images.forEach((img: string, idx: number) => {
            console.log(`[${idx}] ${img}`);
        });
    } else {
        console.log("Product 'Соната 800' not found.");
    }

    if (brizCollection) {
        const url = 'https://everestmebli.com.ua/product/lizhko-everest-briz-astoria-2-853-1932-740-mm-sonoma-biliy-bez-matraca';
        console.log("Fetching:", url);
        const html = await fetch(url).then(r => r.text());

        const imgRegex = /src=["'](\/storage\/products\/[^"']+)["']/g;
        let match;
        console.log("Images found by regex:");
        while ((match = imgRegex.exec(html)) !== null) {
            console.log(match[1]);
        }

        // Also print a snippet of HTML to see context of images
        // We'll search for the first image occurrence and print surrounding 500 chars
        const firstImage = '/storage/products/5/2095/11528_01.jpeg';
        const idx = html.indexOf(firstImage.replace('https://everestmebli.com.ua', ''));
        if (idx !== -1) {
            console.log("\nHTML Context around first image:");
            console.log(html.substring(idx - 500, idx + 500));
        }

        // Check for 'related products' section
        if (html.includes('Похожие товары') || html.includes('Схожі')) {
            console.log("\nPage contains 'Related Products' section.");
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
