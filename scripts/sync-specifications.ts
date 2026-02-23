import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const BASE_URL = 'https://everestmebli.com.ua';
const CATEGORY_URL = 'https://everestmebli.com.ua/collection/sonata';
const TOTAL_PAGES = 6;

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchProductSpecs(url: string) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;

        const html = await res.text();
        const $ = cheerio.load(html);

        let sku = '';

        // Match from image thumb src
        const imgRegex = /src="(\/storage\/products\/[^"]+)"/g;
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
            const skuMatch = match[1].match(/\/(\d+)_/);
            if (skuMatch) {
                sku = skuMatch[1];
                break;
            }
        }

        if (!sku) {
            const domSkuMatch = html.match(/>(\d{4,5})</);
            if (domSkuMatch) sku = domSkuMatch[1];
        }

        if (!sku) {
            return null; // No SKU on page
        }

        const rawSpecs: Record<string, string> = {};
        $('p.font-17.mb-1').each((_, el) => {
            const title = $(el).find('span.ubuntu-medium').text().trim().replace(':', '');
            // Remove the span to get the remaining text
            $(el).find('span.ubuntu-medium').remove();
            const value = $(el).text().trim();
            if (title && value) {
                rawSpecs[title] = value;
            }
        });

        if (Object.keys(rawSpecs).length === 0) {
            return { sku, specs: null }; // No specs found
        }

        // Map to our format
        const specs = {
            general: {
                roomUse: '',
                location: rawSpecs['Тип опор'] === 'Ніжки не регульовані' || rawSpecs['Тип опор'] === 'Ніжки' ? 'Напольна' : (rawSpecs['Тип опор'] || ''),
                drawerGuides: rawSpecs['Тип напрямних'] || rawSpecs['Тип направляючих для висувних шухляд'] || '',
                drawerCount: rawSpecs['Кількість висувних шухляд'] || ''
            },
            materials: {
                frameEdge: rawSpecs['Матеріал виготовлення фасадів']?.includes('ПВХ') ? 'ПВХ' : '',
                frameMaterial: rawSpecs['Матеріал виготовлення корпусу'] || '',
                facadeMaterial: rawSpecs['Матеріал виготовлення фасадів'] || '',
                facadeEdge: ''
            },
            frame: {
                shelfCount: rawSpecs['Кількість полиць'] || ''
            },
            warranty: {
                period: rawSpecs['Гарантійний срок (міс.)'] || rawSpecs['Гарантійний термін'] ? `${rawSpecs['Гарантійний срок (міс.)'] || rawSpecs['Гарантійний термін']} місяців` : '',
                production: rawSpecs['Країна виробник'] || 'Україна'
            }
        };

        return { sku, specs };
    } catch (e) {
        console.error(`Error fetching specs from ${url}:`, e);
        return null;
    }
}

async function main() {
    console.log('Fetching all products with SKUs from DB into memory...');
    const dbProducts = await prisma.product.findMany({
        where: { sku: { not: null, notIn: [''] } }
    });

    // Create a map of sku -> Product
    const productBySku = new Map<string, any>();
    for (const p of dbProducts) {
        if (p.sku) productBySku.set(p.sku, p);
    }

    console.log(`Loaded ${productBySku.size} local products with SKUs.`);

    let updatedCount = 0;

    for (let page = 1; page <= TOTAL_PAGES; page++) {
        console.log(`\nFetching category page ${page}...`);
        const pageUrl = `${CATEGORY_URL}/?page=${page}`;

        try {
            const res = await fetch(pageUrl);
            const html = await res.text();

            // Find all product links
            const linkRegex = /href="https:\/\/everestmebli\.com\.ua\/product\/([^"]+)"/g;
            let match;
            const links = new Set<string>();
            while ((match = linkRegex.exec(html)) !== null) {
                links.add(`https://everestmebli.com.ua/product/${match[1]}`);
            }

            const uniqueLinks = Array.from(links);

            for (const link of uniqueLinks) {
                console.log(`Scraping product: ${link}`);
                const result = await fetchProductSpecs(link);
                if (!result || !result.sku || !result.specs) {
                    console.log(`  ❌ No specs or SKU found on page.`);
                    await delay(1000);
                    continue;
                }

                const { sku, specs } = result;

                // Do we have this product in local DB?
                const localProd = productBySku.get(sku);
                if (!localProd) {
                    console.log(`  ⚠️ SKU ${sku} found but not in local DB.`);
                    await delay(1000);
                    continue;
                }

                // Merge with existing specs (preserve colors if any)
                let existingSpecs = { colors: [] };
                if (localProd.specifications) {
                    try {
                        existingSpecs = JSON.parse(localProd.specifications);
                    } catch (e) { }
                }

                const mergedSpecs = {
                    ...specs,
                    colors: existingSpecs.colors || []
                };

                // Update Database
                await prisma.product.update({
                    where: { id: localProd.id },
                    data: {
                        specifications: JSON.stringify(mergedSpecs)
                    }
                });

                console.log(`  ✅ Updated specs for SKU ${sku}`);
                updatedCount++;

                // Be nice to the server
                await delay(1000);
            }
        } catch (err: any) {
            console.error(`Failed on page ${page}: ${err.message}`);
        }
    }

    console.log(`\n🎉 sync complete! Updated ${updatedCount} products.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
