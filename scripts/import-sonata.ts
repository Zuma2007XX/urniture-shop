
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import https from 'https';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const BASE_URL = 'https://everestmebli.com.ua';
const COLLECTION_URL = `${BASE_URL}/collection/sonata`;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'sonata');

async function downloadImage(url: string, filename: string): Promise<string> {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const filepath = path.join(UPLOAD_DIR, filename);
    // Relative URL for DB
    const publicPath = `/uploads/sonata/${filename}`;

    if (fs.existsSync(filepath)) {
        return publicPath;
    }

    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 200) {
                const stream = fs.createWriteStream(filepath);
                res.pipe(stream);
                stream.on('finish', () => {
                    stream.close();
                    resolve(publicPath);
                });
            } else if (res.statusCode === 301 || res.statusCode === 302) {
                if (res.headers.location) {
                    downloadImage(res.headers.location, filename).then(resolve).catch(reject);
                } else {
                    reject(new Error(`Redirect without location`));
                }
            } else {
                reject(new Error(`Failed to download image: ${res.statusCode}`));
            }
        });

        req.on('error', (err) => {
            reject(err);
        });
    });
}

function extractDimensions(name: string) {
    // Match Latin 'x' or Cyrillic 'х'
    const match = name.match(/(\d+)[xх](\d+)[xх](\d+)/);
    if (match) {
        return {
            width: match[1],
            depth: match[2],
            height: match[3]
        };
    }
    return null;
}

function extractPrice(html: string): number {
    // Attempt 1: Schema.org
    const metaMatch = html.match(/itemprop="price"\s+content="(\d+)"/);
    if (metaMatch) return parseFloat(metaMatch[1]);

    // Attempt 2: Common patterns
    const priceMatch = html.match(/class="[^"]*price[^"]*"[^>]*>\s*([\d\s]+)\s*грн/);
    if (priceMatch) {
        return parseFloat(priceMatch[1].replace(/\s/g, ''));
    }

    // Attempt 3: Livewire or other structures?
    // Failing that, return 0.
    return 0;
}

function extractImage(html: string): string | null {
    // 1. Fancybox carousel slide (data-thumb-src)
    const slideMatch = html.match(/<div[^>]*class="[^"]*f-carousel__slide[^"]*"[^>]*data-thumb-src="([^"]+)"/);
    if (slideMatch) return slideMatch[1];

    // 2. Fancybox anchor
    const anchorMatch = html.match(/<a[^>]*href="([^"]+)"[^>]*class="[^"]*fancybox[^"]*"[^>]*>/);
    if (anchorMatch) return anchorMatch[1];

    // 3. Fallback to og:image ONLY if it is NOT the logo
    const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/);
    if (ogMatch && !ogMatch[1].includes('logo')) return ogMatch[1];

    // 4. Fallback to extraction from img tag
    const imgMatch = html.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*product-image[^"]*"/);
    if (imgMatch) return imgMatch[1];

    return null;
}

function extractDescription(html: string): string {
    const descMatch = html.match(/<div[^>]*itemprop="description"[^>]*>([\s\S]*?)<\/div>/);
    if (descMatch) {
        return descMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    // Fallback to searching for description in tabs if possible, or just empty
    return "Опис відсутній";
}

async function main() {
    console.log('Starting Sonata import...');

    let collection = await prisma.collection.findFirst({
        where: {
            OR: [
                { slug: 'sonata' },
                { slug: 'Sonata' }, // Handle existing collection casing
                { title: 'Соната' }
            ]
        }
    });

    if (!collection) {
        console.log('Creating Sonata collection...');
        collection = await prisma.collection.create({
            data: {
                title: 'Мебльна система Соната',
                slug: 'sonata',
                description: 'Сучасна меблева система Соната від Еверест. Стильний дизайн, функціональність та якість.',
            }
        });
    }

    // Cleanup existing to avoid duplicates/partial data
    console.log('Cleaning up existing Sonata products...');
    const deleted = await prisma.product.deleteMany({
        where: { collectionId: collection.id }
    });
    console.log(`Deleted ${deleted.count} existing products.`);

    console.log('Fetching collection page...');
    const response = await fetch(COLLECTION_URL);
    const html = await response.text();

    const productLinks = new Set<string>();
    const linkRegex = /href="(https:\/\/everestmebli\.com\.ua\/product\/[^"]+)"/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        productLinks.add(match[1]);
    }

    console.log(`Found ${productLinks.size} products.`);

    for (const link of productLinks) {
        try {
            console.log(`Processing: ${link}`);
            const pRes = await fetch(link);
            const pHtml = await pRes.text();

            const titleMatch = pHtml.match(/<h1[^>]*>([^<]+)<\/h1>/);
            const name = titleMatch ? titleMatch[1].trim() : 'Unknown Product';

            const price = extractPrice(pHtml);
            const imageUrl = extractImage(pHtml);

            if (!imageUrl) {
                console.log(`  Skipping ${name} (no image found)`);
                continue;
            }

            const description = extractDescription(pHtml);
            const dimensions = extractDimensions(name);

            let localImagePath = '';
            if (imageUrl) {
                const filename = `${path.basename(imageUrl).split('?')[0]}`;
                try {
                    // Handle relative URLs
                    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                    // Special fix for everest URLs that might be relative
                    // Actually most are /storage/...
                    localImagePath = await downloadImage(fullUrl, filename);
                } catch (imgErr) {
                    console.error(`    Image download failed: ${imgErr}`);
                    continue;
                }
            }

            let category = 'furniture';
            if (name.toLowerCase().includes('комод')) category = 'commodes';
            if (name.toLowerCase().includes('шафа')) category = 'wardrobes';
            if (name.toLowerCase().includes('пенал')) category = 'pencil_cases';
            if (name.toLowerCase().includes('стіл')) category = 'tables';
            if (name.toLowerCase().includes('ліжко')) category = 'single_beds';
            if (name.toLowerCase().includes('тумба')) category = 'bedside_tables';
            if (name.toLowerCase().includes('вішалка')) category = 'wall_hangers';

            await prisma.product.create({
                data: {
                    name,
                    description,
                    price,
                    images: JSON.stringify([localImagePath]),
                    category,
                    collectionId: collection.id,
                    specifications: dimensions ? JSON.stringify({
                        dimensions: {
                            width: dimensions.width,
                            height: dimensions.height,
                            depth: dimensions.depth
                        }
                    }) : null,
                    material: 'ЛДСП',
                    stock: 100, // Default stock
                }
            });

            console.log(`  Imported: ${name} - ${price} UAH`);
            await new Promise(r => setTimeout(r, 200));

        } catch (e) {
            console.error(`  Failed to process ${link}:`, e);
            // Continue even if one fails
        }
    }

    console.log('Import complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
