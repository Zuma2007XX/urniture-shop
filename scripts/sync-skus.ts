
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const BASE_URL = 'https://everestmebli.com.ua';
const COLLECTION_URL = `${BASE_URL}/collection/sonata`;

async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.text();
}

async function main() {
    console.log('Fetching collection page...');
    const collectionHtml = await fetchHtml(COLLECTION_URL);

    // Extract product links
    const productLinkRegex = /href=["'](https:\/\/everestmebli\.com\.ua\/product\/[^"']+)["']/g;
    const links = new Set<string>();
    let match;
    while ((match = productLinkRegex.exec(collectionHtml)) !== null) {
        if (!match[1].includes('#')) {
            links.add(match[1]);
        }
    }

    console.log(`Found ${links.size} product links.`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Process a subset for testing or all? All.
    for (const link of links) {
        try {
            const html = await fetchHtml(link);

            // Extract Name
            // Regex handling attributes
            const nameMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            if (!nameMatch) {
                console.warn(`Could not find name for ${link}`);
                // console.log('HTML snippet:', html.substring(0, 500));
                continue;
            }
            const name = nameMatch[1].trim()
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&');

            // Extract SKU
            const skuMatch = /Артикул\s*:\s*(\d+)/.exec(html);
            if (!skuMatch) {
                console.warn(`Could not find SKU for ${name} (${link})`);
                continue;
            }
            const sku = skuMatch[1];

            // Find product in DB
            const product = await prisma.product.findFirst({
                where: { name: name }
            });

            if (product) {
                if (product.sku !== sku) {
                    await prisma.product.update({
                        where: { id: product.id },
                        data: { sku: sku }
                    });
                    console.log(`UPDATED: ${name} -> SKU: ${sku}`);
                    updatedCount++;
                } else {
                    // console.log(`SKIPPED (Same SKU): ${name}`);
                }
            } else {
                console.log(`NOT FOUND in DB: ${name}`);
                skippedCount++;
            }

            await new Promise(r => setTimeout(r, 100));

        } catch (e) {
            console.error(`Error processing ${link}:`, e);
        }
    }

    console.log(`Done. Updated: ${updatedCount}, Missing/Skipped: ${skippedCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
