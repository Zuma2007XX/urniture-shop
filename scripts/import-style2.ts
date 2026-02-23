
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
dotenv.config();

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const BASE_URL = 'https://everestmebli.com.ua';
const COLLECTION_URL = `${BASE_URL}/collection/stayl-2`;

// Prices from user image
const PRICE_MAP: Record<string, number> = {
    // Exact matches or key phrases based on user image
    "Комод 1600": 5143,
    "Пенал 500": 3973,
    "Тумба приліжкова 500": 1525,
    "Шафа 1400": 9189,
};

async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.text();
}

function normalize(str: string) {
    return str.toLowerCase().replace(/ё/g, 'е').replace(/-/g, ' ');
}

function getPrice(productName: string): number {
    const pName = normalize(productName);

    // Flexible matching
    if (pName.includes("комод") && (pName.includes("160") || pName.includes("1600") || pName.includes("1602"))) return 5143;
    if (pName.includes("пенал") && (pName.includes("500") || pName.includes("502"))) return 3973;
    if (pName.includes("тумба")) return 1525;
    if (pName.includes("шафа") && (pName.includes("140") || pName.includes("1400") || pName.includes("1402"))) return 9189;

    return 0;
}

async function main() {
    console.log('Connecting to DB...');

    // Find "Style" collection
    let collection = await prisma.collection.findFirst({
        where: { title: { contains: 'Стайл' } }
    });

    if (!collection) {
        console.log('Collection "Стайл" not found. Creating it...');
        collection = await prisma.collection.create({
            data: {
                title: 'Стайл',
                slug: 'style',
                description: 'Колекція меблів Стайл',
                image: '' // Will fill later if needed
            }
        });
    }

    console.log(`Using Collection: ${collection.title} (${collection.id})`);

    console.log(`Fetching collection page: ${COLLECTION_URL}`);
    const collectionHtml = await fetchHtml(COLLECTION_URL);

    // Extract product links
    // Regex for href="https://everestmebli.com.ua/product/..."
    const productLinkRegex = /href=["'](https:\/\/everestmebli\.com\.ua\/product\/[^"']+)["']/g;
    const links = new Set<string>();
    let match;
    while ((match = productLinkRegex.exec(collectionHtml)) !== null) {
        if (!match[1].includes('#')) links.add(match[1]);
    }

    console.log(`Found ${links.size} products.`);

    for (const link of links) {
        try {
            console.log(`Scraping ${link}...`);
            const html = await fetchHtml(link);

            // Name
            const nameMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            if (!nameMatch) {
                console.log('No name found, skipping.');
                continue;
            }
            let name = nameMatch[1].trim().replace(/&quot;/g, '"').replace(/&amp;/g, '&');

            // SKU
            const skuMatch = /Артикул\s*:\s*(\d+)/.exec(html);
            const sku = skuMatch ? skuMatch[1] : `STYLE-${Date.now()}`; // Fallback SKU

            // Images
            // Look for images in the gallery or main image
            // Note: Reuse logic from import-briz or similar
            const imgRegex = /src=["'](\/storage\/products\/[^"']+)["']/g;
            const productImages: string[] = [];
            let iMatch;
            while ((iMatch = imgRegex.exec(html)) !== null) {
                const fullUrl = `${BASE_URL}${iMatch[1]}`;
                if (!productImages.includes(fullUrl)) {
                    productImages.push(fullUrl);
                }
            }

            // Deduplicate logic (sometimes same image appears multiple times)
            const uniqueImages = Array.from(new Set(productImages));

            if (uniqueImages.length === 0) {
                const ogImg = /property="og:image" content="([^"]+)"/.exec(html);
                if (ogImg && !ogImg[1].includes('og-logo.png')) {
                    uniqueImages.push(ogImg[1]);
                }
            }

            // Price
            const price = getPrice(name);

            console.log(`  Name: ${name}`);
            console.log(`  SKU: ${sku}`);
            console.log(`  Price: ${price}`);
            console.log(`  Images: ${uniqueImages.length}`);

            // Upsert Product
            const data = {
                name,
                description: `Меблі з колекції Стайл. ${name}`,
                price: price,
                images: JSON.stringify(uniqueImages),
                category: 'style', // Category slug? Or generic? "Спальні" maybe?
                sku: sku,
                collectionId: collection!.id,
                stock: 100
            };

            const existing = await prisma.product.findFirst({
                where: { sku: sku }
            });

            if (existing) {
                await prisma.product.update({
                    where: { id: existing.id },
                    data: { ...data }
                });
                console.log('  Updated.');
            } else {
                await prisma.product.create({
                    data: { ...data }
                });
                console.log('  Created.');
            }

        } catch (e) {
            console.error(`Error processing ${link}:`, e);
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('Done.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
