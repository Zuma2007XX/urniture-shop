import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const COLLECTIONS = [
    'https://everestmebli.com.ua/collection/layt-2',
    'https://everestmebli.com.ua/collection/nordik',
    'https://everestmebli.com.ua/collection/briz',
    'https://everestmebli.com.ua/collection/siti',
    'https://everestmebli.com.ua/collection/sonata',
    'https://everestmebli.com.ua/collection/style'
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWeightFromEverest(url: string): Promise<number | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const html = await res.text();
        const $ = cheerio.load(html);

        let weight = 0;
        $('table.table-striped tbody tr').each((_, el) => {
            const tds = $(el).find('td');
            if (tds.length >= 6) {
                weight += parseFloat($(tds[2]).text().trim().replace(',', '.')) || 0;
            }
        });

        return weight > 0 ? weight : null;
    } catch (e) {
        return null;
    }
}

function extractDimensionsFromName(name: string) {
    // Looks for patterns like 450x360x2080 or 400х376х2050 (cyrillic or latin x)
    const dimMatch = name.match(/(\d+)\s*[xх]\s*(\d+)\s*[xх]\s*(\d+)/i);
    if (dimMatch) {
        return {
            width: parseInt(dimMatch[1], 10),
            depth: parseInt(dimMatch[2], 10),
            height: parseInt(dimMatch[3], 10)
        };
    }
    return null;
}

async function main() {
    console.log('Fetching products from DB...');
    const products = await prisma.product.findMany();

    const skuToId = new Map(products.filter(p => p.sku).map(p => [p.sku, p.id]));
    const names = new Map(products.map(p => [p.id, p.name]));
    const specsMap = new Map(products.map(p => [p.id, p.specifications]));

    let updatedCount = 0;

    for (const categoryUrl of COLLECTIONS) {
        console.log(`\nStarting collection: ${categoryUrl}`);
        for (let page = 1; page <= 5; page++) {
            try {
                const res = await fetch(`${categoryUrl}/?page=${page}`);
                if (!res.ok) break;
                const html = await res.text();

                const linkRegex = /href="https:\/\/everestmebli\.com\.ua\/product\/([^"]+)"/g;
                let match;
                const links = new Set<string>();
                while ((match = linkRegex.exec(html)) !== null) {
                    links.add(`https://everestmebli.com.ua/product/${match[1]}`);
                }
                if (links.size === 0) break;

                for (const url of links) {
                    try {
                        const prodRes = await fetch(url);
                        const prodHtml = await prodRes.text();
                        const $ = cheerio.load(prodHtml);

                        let sku = '';
                        const domSkuMatch = prodHtml.match(/Артикул\s*:\s*(\d{4,5})/);
                        if (domSkuMatch) sku = domSkuMatch[1];
                        if (!sku) {
                            const imgRegex = /src="(\/storage\/products\/[^"]+)"/g;
                            let iMatch;
                            while ((iMatch = imgRegex.exec(prodHtml)) !== null) {
                                const skuMatch = iMatch[1].match(/\/(\d+)_/);
                                if (skuMatch) {
                                    sku = skuMatch[1]; break;
                                }
                            }
                        }

                        if (!sku) continue;

                        const id = skuToId.get(sku);
                        if (!id) continue;

                        const name = names.get(id) || '';
                        const dims = extractDimensionsFromName(name);

                        let weight = 0;
                        $('table.table-striped tbody tr').each((_, el) => {
                            const tds = $(el).find('td');
                            if (tds.length >= 6) {
                                weight += parseFloat($(tds[2]).text().trim().replace(',', '.')) || 0;
                            }
                        });

                        if (dims || weight > 0) {
                            let specs = { dimensions: {} as any };
                            if (specsMap.get(id)) {
                                try { specs = JSON.parse(specsMap.get(id) as string); } catch (e) { }
                            }

                            specs.dimensions = specs.dimensions || {};
                            if (dims) {
                                specs.dimensions.width = dims.width;
                                specs.dimensions.depth = dims.depth;
                                specs.dimensions.height = dims.height;
                            }
                            if (weight > 0) {
                                specs.dimensions.weight = Math.round(weight * 10) / 10;
                            }

                            await prisma.product.update({
                                where: { id },
                                data: { specifications: JSON.stringify(specs) }
                            });
                            console.log(`  ✅ Updated dims/weight for SKU ${sku}`);
                            updatedCount++;
                        }
                    } catch (e) { /* ignore */ }
                    await delay(300);
                }
            } catch (e) { break; }
        }
    }

    // Now loop over the rest of the local DB to just extract dimensions from titles even if not on Everest
    console.log("\nProcessing remaining local products for name parsing...");
    for (const p of products) {
        const dims = extractDimensionsFromName(p.name);
        if (dims) {
            let specs = { dimensions: {} as any };
            try { if (p.specifications) specs = JSON.parse(p.specifications); } catch (e) { }

            if (!specs.dimensions || (!specs.dimensions.width && dims.width)) {
                specs.dimensions = specs.dimensions || {};
                specs.dimensions.width = dims.width;
                specs.dimensions.depth = dims.depth;
                specs.dimensions.height = dims.height;

                await prisma.product.update({
                    where: { id: p.id },
                    data: { specifications: JSON.stringify(specs) }
                });
                updatedCount++;
            }
        }
    }

    console.log(`\n🎉 Done! Updated ${updatedCount} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
