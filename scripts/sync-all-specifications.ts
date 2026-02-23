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
    'https://everestmebli.com.ua/collection/style'
];

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
        const domSkuMatch = html.match(/Артикул\s*:\s*(\d{4,5})/);
        if (domSkuMatch) sku = domSkuMatch[1];

        if (!sku) {
            const imgRegex = /src="(\/storage\/products\/[^"]+)"/g;
            let match;
            while ((match = imgRegex.exec(html)) !== null) {
                const skuMatch = match[1].match(/\/(\d+)_/);
                if (skuMatch) {
                    sku = skuMatch[1];
                    break;
                }
            }
        }

        if (!sku) return null;

        const rawSpecs: Record<string, string> = {};
        $('p.font-17.mb-1').each((_, el) => {
            const title = $(el).find('span.ubuntu-medium').text().trim().replace(':', '');
            $(el).find('span.ubuntu-medium').remove();
            const value = $(el).text().trim();
            if (title && value) {
                rawSpecs[title] = value;
            }
        });

        if (Object.keys(rawSpecs).length === 0) return { sku, specs: null };

        const specs = {
            general: {
                roomUse: '',
                location: rawSpecs['Тип опор'] === 'Ніжки не регульовані' || rawSpecs['Тип опор'] === 'Ніжки' ? 'Напольна' : (rawSpecs['Тип опор'] || ''),
                drawerGuides: rawSpecs['Тип напрямних'] || rawSpecs['Тип направляючих для висувних шухляд'] || '',
                drawerCount: rawSpecs['Кількість висувних шухляд'] || ''
            },
            materials: {
                frameEdge: rawSpecs['Матеріал виготовлення фасадів']?.includes('ПВХ') || rawSpecs['Крайка']?.includes('ПВХ') ? 'ПВХ' : (rawSpecs['Крайка'] || ''),
                frameMaterial: rawSpecs['Матеріал виготовлення корпусу'] || rawSpecs['Матеріал корпусу'] || '',
                facadeMaterial: rawSpecs['Матеріал виготовлення фасадів'] || rawSpecs['Матеріал фасаду'] || '',
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
        return null;
    }
}

async function main() {
    console.log('Fetching all products with SKUs from DB into memory...');
    const dbProducts = await prisma.product.findMany({
        where: { sku: { not: null, notIn: [''] } }
    });

    const productBySku = new Map<string, any>();
    for (const p of dbProducts) {
        if (p.sku) productBySku.set(p.sku, p);
    }

    let updatedCount = 0;

    for (const categoryUrl of COLLECTIONS) {
        console.log(`\n==============\nStarting collection: ${categoryUrl}\n==============`);
        // Simple loop up to 5 pages per collection
        for (let page = 1; page <= 5; page++) {
            const pageUrl = `${categoryUrl}/?page=${page}`;
            try {
                const res = await fetch(pageUrl);
                if (!res.ok) break; // collection has fewer pages
                const html = await res.text();

                const linkRegex = /href="https:\/\/everestmebli\.com\.ua\/product\/([^"]+)"/g;
                let match;
                const links = new Set<string>();
                while ((match = linkRegex.exec(html)) !== null) {
                    links.add(`https://everestmebli.com.ua/product/${match[1]}`);
                }

                if (links.size === 0) break; // no products on this page, stop pagination

                const uniqueLinks = Array.from(links);

                for (const link of uniqueLinks) {
                    const result = await fetchProductSpecs(link);
                    if (!result || !result.sku || !result.specs) {
                        await delay(500);
                        continue;
                    }

                    const { sku, specs } = result;

                    const localProd = productBySku.get(sku);
                    if (!localProd) {
                        await delay(500);
                        continue;
                    }

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

                    await prisma.product.update({
                        where: { id: localProd.id },
                        data: {
                            specifications: JSON.stringify(mergedSpecs)
                        }
                    });

                    console.log(`  ✅ Updated specs for SKU ${sku} (${localProd.name})`);
                    updatedCount++;
                    await delay(500);
                }
            } catch (err: any) {
                console.error(`Failed on collection ${categoryUrl} page ${page}: ${err.message}`);
                break;
            }
        }
    }

    console.log(`\n🎉 sync complete! Updated ${updatedCount} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
