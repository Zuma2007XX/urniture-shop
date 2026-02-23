
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
dotenv.config();

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const BASE_URL = 'https://everestmebli.com.ua';
const COLLECTION_URL = `${BASE_URL}/collection/siti`;

function normalize(str: string) {
    return str.toLowerCase().replace(/ё/g, 'е').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

function getPrice(productName: string): number {
    const pName = normalize(productName);

    // Price mapping based on user image for SITI (Ситі)

    // Chests (Komod)
    if (pName.includes("комод") && pName.includes("1150")) return 3665;
    if (pName.includes("комод") && pName.includes("1500")) return 4280;

    // Beds (Lizhko)
    if (pName.includes("ліжко") && pName.includes("1400")) return 4895;
    if (pName.includes("ліжко") && pName.includes("1600")) return 5190;

    // Penal
    if (pName.includes("пенал") && pName.includes("400")) return 2996;

    // Shelves (Politsi)
    if (pName.includes("полиці до шафи") && pName.includes("1200")) return 561;
    if (pName.includes("полиці до шафи") && pName.includes("1600")) return 950;
    if (pName.includes("полиці над шухлядами")) return 669;

    // Tables (Stil)
    if (pName.includes("стіл") && pName.includes("1100")) return 2929;
    if (pName.includes("стіл") && pName.includes("міні") && pName.includes("750")) return 1458;

    // Cabinets (Tumba)
    if (pName.includes("тумба") && pName.includes("взуття") && pName.includes("160")) return 1605; // 160-2
    if (pName.includes("тумба") && pName.includes("приліжкова") && pName.includes("450")) return 1378;

    // Wardrobes (Shafa / Shkaf)
    if ((pName.includes("шафа") || pName.includes("шкаф")) && pName.includes("1200")) return 7784;
    if ((pName.includes("шафа") || pName.includes("шкаф")) && pName.includes("1600")) return 9215;
    if ((pName.includes("шафа") || pName.includes("шкаф")) && pName.includes("800")) return 5685;

    // Components (Karkas, Mechanism, Shields, Bottoms)
    if (pName.includes("каркас") && pName.includes("1400")) return 3446;
    if (pName.includes("каркас") && pName.includes("1600")) return 3574;

    if (pName.includes("підйомного механізму")) return 1795;

    if (pName.includes("щит дсп") && pName.includes("1400")) return 2468;
    if (pName.includes("щит дсп") && pName.includes("1600")) return 2735;

    if (pName.includes("дно двп") && pName.includes("1400")) return 521;
    if (pName.includes("дно двп") && pName.includes("1600")) return 581;

    return 0;
}

async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.text();
}

async function main() {
    console.log('Connecting to DB...');

    // Find "Siti" collection
    let collection = await prisma.collection.findFirst({
        where: { title: { contains: 'Сити' } } // User confirmed it exists as "Сити" (or "Siti"?) - DB says "Сити"
    });

    if (!collection) {
        console.error('Collection "Сити" NOT found!');
        return;
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

            // Normalize Name
            name = name.replace(/×/g, 'x');

            // SKU
            const skuMatch = /Артикул\s*:\s*(\d+)/.exec(html);
            const sku = skuMatch ? skuMatch[1] : `SITI-${Date.now()}`;

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
            console.log(`  Price: ${price}`);
            // console.log(`  Images: ${uniqueImages.length}`);

            // Upsert Product
            const data = {
                name,
                description: `Меблі з колекції Сіті. ${name}`,
                price: price,
                images: JSON.stringify(uniqueImages),
                category: 'siti',
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
