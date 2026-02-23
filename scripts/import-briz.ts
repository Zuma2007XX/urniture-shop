
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const COLLECTION_ID = 'cmlm5rd6w0007horiqiqglwhd'; // From previous step
const BASE_URL = 'https://everestmebli.com.ua';
const COLLECTION_URL = `${BASE_URL}/collection/briz`;

const PRICE_MAP: Record<string, number> = {
    "Бріз Асторія-2": 2970, // "Асторія 2"
    "Бріз Асторія": 5329, // Order matters? Longest first?
    "Бріз Бокове огородження для Асторія-2": 490,
    "Бріз вішалка": 2878,
    "Бріз К-5": 2883, // Removed NEW
    "Бріз К-6": 4368, // Removed NEW
    "Бріз пенал-14": 2795,
    "Бріз пенал-15": 3384,
    "Бріз пенал-16": 3661,
    "Бріз пенал-17": 4153,
    "Бріз-17": 4153, // Alias
    "Бріз пенал-18": 1951,
    "Бріз стінка": 8801,
    "Бріз ТО-4": 3873,
    "Бріз ШКУ-14": 5778,
    "Бріз ШП-2": 3560,
    "Бріз ШП-4": 6928,
    "Бріз ШП-5": 9210,
    "Дзеркало для Бріз ШП-4": 791, // Partial match ok
    "Бріз Комфорт": 4458,
    "Бріз Надбудова": 2211, // Simplified
    "Бріз Трюмо-1": 3615,
    "Бріз Т-1": 914, // "Тумба приліжкова Т-1" -> "Т-1"
    "Бріз Школяр-3": 2235,
    "Бріз Школяр-4": 2970,
    "Бріз Школяр-5": 2106,
    "Бріз Школяр-6": 6114,
    "Бріз ящик висувний": 976
};

function normalize(str: string) {
    return str.toLowerCase().replace(/ё/g, 'е').replace(/-/g, ' ');
}

function getPrice(productName: string): number {
    const pName = normalize(productName);

    // Manual overrides for tricky cases (handling spaces from dashes)
    if (pName.includes("к 5") || pName.includes("k 5")) return 2883;
    if (pName.includes("к 6") || pName.includes("k 6")) return 4368;
    if (pName.includes("бріз 15") || pName.includes("пенал 15")) return 3384;
    if (pName.includes("бріз 17") || pName.includes("пенал 17") || pName.includes("шафа 17")) return 4153;
    if (pName.includes("т 1") || pName.includes("t 1")) return 914;
    if (pName.includes("надбудова")) return 2211;
    if (pName.includes("шку 14")) return 5778;
    if (pName.includes("шп 2")) return 3560;
    if (pName.includes("шп 4")) return 6928;
    if (pName.includes("шп 5")) return 9210;

    // Sort keys by length desc to match longest first (specifics before generals)
    const keys = Object.keys(PRICE_MAP).sort((a, b) => b.length - a.length);

    for (const key of keys) {
        const kName = normalize(key);

        // Token matching
        const tokens = kName.split(' ').filter(t => t.length > 0 && t !== 'для');
        const pTokens = pName.split(' ');

        const allTokensMatch = tokens.every(t => {
            if (/^\d+$/.test(t)) {
                // Number matching: ensure it's a distinct token in pTokens
                return pTokens.includes(t);
            }
            // Text matching: simple inclusion
            return pName.includes(t);
        });

        if (allTokensMatch) {
            return PRICE_MAP[key];
        }
    }
    return 0;
}

async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.text();
}

async function main() {
    console.log('Fetching collection page...');
    const collectionHtml = await fetchHtml(COLLECTION_URL);

    const productLinkRegex = /href=["'](https:\/\/everestmebli\.com\.ua\/product\/[^"']+)["']/g;
    const links = new Set<string>();
    let match;
    while ((match = productLinkRegex.exec(collectionHtml)) !== null) {
        if (!match[1].includes('#')) links.add(match[1]);
    }

    console.log(`Found ${links.size} products.`);

    let processed = 0;

    for (const link of links) {
        try {
            const html = await fetchHtml(link);

            // Extracts
            const nameMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            if (!nameMatch) continue;
            let name = nameMatch[1].trim().replace(/&quot;/g, '"').replace(/&amp;/g, '&');

            const skuMatch = /Артикул\s*:\s*(\d+)/.exec(html);
            const sku = skuMatch ? skuMatch[1] : null;

            // improved image extraction
            const imgRegex = /src=["'](\/storage\/products\/[^"']+)["']/g;
            const productImages: string[] = [];
            let iMatch;
            while ((iMatch = imgRegex.exec(html)) !== null) {
                if (!productImages.includes(iMatch[1])) {
                    productImages.push(`${BASE_URL}${iMatch[1]}`);
                }
            }

            // Fallback if no specific product images found
            let imgUrl = productImages.length > 0 ? productImages[0] : '';

            if (!imgUrl) {
                const ogImg = /property="og:image" content="([^"]+)"/.exec(html);
                if (ogImg && !ogImg[1].includes('og-logo.png')) {
                    imgUrl = ogImg[1];
                    productImages.push(imgUrl);
                }
            }

            const price = getPrice(name);

            console.log(`Processing: ${name} | SKU: ${sku} | Price: ${price} | Images: ${productImages.length}`);

            // Upsert Product
            const data = {
                name,
                description: `Меблі з колекції Бріз. ${name}`,
                price: price,
                images: JSON.stringify(productImages), // Store all images
                category: 'briz',
                sku: sku,
                collectionId: COLLECTION_ID,
                stock: 100 // Default stock
            };

            if (sku) {
                await prisma.product.upsert({
                    where: { sku: sku },
                    update: { ...data }, // Update everything to ensure sync
                    create: { ...data }
                });
            } else {
                // Fallback to name match check
                const existing = await prisma.product.findFirst({ where: { name: name } });
                if (existing) {
                    await prisma.product.update({
                        where: { id: existing.id },
                        data: { ...data }
                    });
                } else {
                    await prisma.product.create({
                        data: { ...data }
                    });
                }
            }
            processed++;

        } catch (e) {
            console.error(`Error processing ${link}:`, e);
        }

        await new Promise(r => setTimeout(r, 50)); // Rate limit
    }
    console.log(`Processed ${processed} products.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
