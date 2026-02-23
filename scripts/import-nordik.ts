
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
dotenv.config();

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const BASE_URL = 'https://everestmebli.com.ua';
const COLLECTION_URL = `${BASE_URL}/collection/nordik`;

function normalize(str: string) {
    return str.toLowerCase().replace(/ё/g, 'е').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

function getPrice(productName: string): number {
    const pName = normalize(productName);

    // Price mapping based on user image

    // Hangers
    // "Вішалки" vs "Вішалка"
    if (pName.includes("вішал") && (pName.includes("800") || pName.includes("настінна"))) return 614;
    if (pName.includes("вішал") && pName.includes("900")) return 1276;

    // Mirrors
    if (pName.includes("дзеркало") && pName.includes("800")) return 1605;

    // Chests (Komod)
    if (pName.includes("комод") && pName.includes("1400")) return 4865;

    // Beds
    if (pName.includes("ліжко") && pName.includes("1400")) return 3495;
    if (pName.includes("ліжко") && pName.includes("1600")) return 3748;

    // Penals
    if (pName.includes("пенал") && pName.includes("відкритий") && pName.includes("600")) return 3825;
    if (pName.includes("пенал") && (pName.includes("закритий") || pName.includes("дзеркало")) && pName.includes("800")) return 6155;

    // Shelves
    if (pName.includes("полиця") && pName.includes("1000")) return 441;

    // Specific Cabinets (Тумба)
    if (pName.includes("тумба 2") && pName.includes("980")) return 2030; // Тумба 2-о дверна 980
    if (pName.includes("тумба 4") && pName.includes("980")) return 3400; // Тумба 4-и дверна 980

    // Shoe cabinets (Взуття)
    if (pName.includes("взуття") && pName.includes("800")) return 2755;
    if (pName.includes("взуття") && pName.includes("900")) return 1621;

    // Bedside (Приліжкова)
    if (pName.includes("приліжкова") || (pName.includes("тумба") && pName.includes("500") && !pName.includes("взуття"))) return 1181;

    // TV Stand
    if (pName.includes("тв") && pName.includes("1500")) return 2708;

    // Generic Tumba 800 (must be after specific ones)
    if (pName.includes("тумба") && pName.includes("800") && !pName.includes("взуття") && !pName.includes("2-о")) return 3165;

    // Wardrobes (Shafa)
    if (pName.includes("шафа") && (pName.includes("1400") || pName.includes("140"))) return 9131;
    if (pName.includes("шафа") && pName.includes("990")) return 5983;

    return 0;
}

async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.text();
}

async function main() {
    console.log('Connecting to DB...');

    // Find or create "Nordik" collection
    let collection = await prisma.collection.findFirst({
        where: { title: { contains: 'Нордік' } }
    });

    if (!collection) {
        console.log('Collection "Нордік" not found. Creating it...');
        collection = await prisma.collection.create({
            data: {
                title: 'Нордік',
                slug: 'nordik',
                description: 'Колекція меблів Нордік',
                image: ''
            }
        });
    }

    console.log(`Using Collection: ${collection.title} (${collection.id})`);

    console.log(`Fetching collection page: ${COLLECTION_URL}`);
    const collectionHtml = await fetchHtml(COLLECTION_URL);

    // Extract product links
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

            // Normalize Name for better matching if needed (replace 'x' with 'x' etc already done in logic but good to keep in mind)
            name = name.replace(/×/g, 'x');

            // SKU
            const skuMatch = /Артикул\s*:\s*(\d+)/.exec(html);
            const sku = skuMatch ? skuMatch[1] : `NORDIK-${Date.now()}`;

            // Images
            const imgRegex = /src=["'](\/storage\/products\/[^"']+)["']/g;
            const productImages: string[] = [];
            let iMatch;
            while ((iMatch = imgRegex.exec(html)) !== null) {
                const fullUrl = `${BASE_URL}${iMatch[1]}`;
                if (!productImages.includes(fullUrl)) {
                    productImages.push(fullUrl);
                }
            }

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
            console.log(`  Price: ${price} (Target: ${getPrice(name)})`);
            console.log(`  Images: ${uniqueImages.length}`);

            // Upsert Product
            const data = {
                name,
                description: `Меблі з колекції Нордік. ${name}`,
                price: price,
                images: JSON.stringify(uniqueImages),
                category: 'nordik',
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
