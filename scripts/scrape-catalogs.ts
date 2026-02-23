import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.text();
}

const SKU_TO_URL: Record<string, string> = {};

async function buildSitemap() {
    console.log("Fetching catalogs page to build sitemap...");
    const catalogsHtml = await fetchHtml("https://everestmebli.com.ua/catalogs");
    const collectionRegex = /href=["'](https:\/\/everestmebli\.com\.ua\/collection\/[^"']+)["']/g;

    const collectionLinks = new Set<string>();
    let match;
    while ((match = collectionRegex.exec(catalogsHtml)) !== null) {
        collectionLinks.add(match[1]);
    }

    console.log(`Found ${collectionLinks.size} collections to scan.`);

    const productLinks = new Set<string>();
    for (const link of collectionLinks) {
        try {
            const html = await fetchHtml(link);
            const productRegex = /href=["'](https:\/\/everestmebli\.com\.ua\/product\/[^"']+)["']/g;
            let pMatch;
            while ((pMatch = productRegex.exec(html)) !== null) {
                if (!pMatch[1].includes('#')) {
                    productLinks.add(pMatch[1]);
                }
            }
            await new Promise(r => setTimeout(r, 100));
        } catch (e) {
            console.error(`Failed to fetch collection ${link}`);
        }
    }

    console.log(`Discovered ${productLinks.size} total product URLs. Scanning for SKUs...`);

    let c = 0;
    for (const url of productLinks) {
        c++;
        if (c % 10 === 0) console.log(`Scanned ${c}/${productLinks.size} URLs`);
        try {
            const html = await fetchHtml(url);
            const skuMatch = /Артикул\s*:\s*(\d+)/.exec(html);
            if (skuMatch) {
                SKU_TO_URL[skuMatch[1]] = url;
            }
        } catch (e) {
            // Ignore fetch errors
        }
        await new Promise(r => setTimeout(r, 50));
    }

    console.log(`Built map of ${Object.keys(SKU_TO_URL).length} SKUs to URLs.`);
}

function parseSpecs(html: string) {
    const specs: any = {
        general: {},
        materials: {},
        frame: {},
        warranty: {},
        colors: []
    };

    // <p class="font-17 mb-1"><span class="ubuntu-medium">Name:</span> Value</p>
    const propRegex = /<span[^>]*class=["'][^"']*ubuntu-medium[^"']*["'][^>]*>([\s\S]*?)<\/span>\s*([\s\S]*?)(?=<\/p>)/gi;
    let pMatch;

    while ((pMatch = propRegex.exec(html)) !== null) {
        const key = pMatch[1].replace(/&nbsp;/g, ' ').replace(/:/g, '').trim().toLowerCase();
        const value = pMatch[2].replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim();

        if (!value) continue;

        // General
        if (key.includes("кімната") || key.includes("розташування")) specs.general.roomUse = value;
        if (key.includes("тип направляючих")) specs.general.drawerGuides = value;
        if (key.includes("кількість ящиків") || key.includes("кількість дверцят")) {
            specs.general.drawerCount = specs.general.drawerCount ? `${specs.general.drawerCount}, ${value}` : value;
        }

        // Materials
        if (key.includes("кромка") && !key.includes("фасад")) specs.materials.frameEdge = value;
        if (key.includes("матеріал корпусу")) specs.materials.frameMaterial = value;
        if (key.includes("матеріал фасаду")) specs.materials.facadeMaterial = value;
        if (key.includes("кромка") && key.includes("фасад")) specs.materials.facadeEdge = value;

        // Frame
        if (key.includes("кількість полиць")) specs.frame.shelfCount = value;

        // Warranty
        if (key.includes("гарантійний")) specs.warranty.period = value + (value.includes("міс") ? "" : " міс.");
        if (key.includes("країна") || key.includes("виробник")) specs.warranty.production = value;
    }

    return Object.keys(specs.general).length === 0 && Object.keys(specs.materials).length === 0 ? null : specs;
}

async function main() {
    await buildSitemap();

    const products = await prisma.product.findMany();
    let updated = 0;

    console.log(`Processing ${products.length} products in local DB...`);
    for (const p of products) {
        if (!p.sku || !SKU_TO_URL[p.sku]) continue;

        try {
            const html = await fetchHtml(SKU_TO_URL[p.sku]);
            const nextSpecs = parseSpecs(html);

            if (nextSpecs) {
                // merge colors if they exist
                let colors = [];
                try {
                    if (p.specifications) {
                        const existing = JSON.parse(p.specifications);
                        if (existing.colors) colors = existing.colors;
                    }
                } catch (e) { }

                nextSpecs.colors = colors;

                await prisma.product.update({
                    where: { id: p.id },
                    data: { specifications: JSON.stringify(nextSpecs) }
                });
                updated++;
                console.log(`Updated specs for SKU ${p.sku} (${p.name})`);
            }
        } catch (e) {
            console.error(`Failed to update ${p.sku}`);
        }
        await new Promise(r => setTimeout(r, 100)); // rate limit just in case
    }

    console.log(`Done! Updated ${updated} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
