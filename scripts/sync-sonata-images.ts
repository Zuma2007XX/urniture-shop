import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma';
import https from 'https';

const BASE_URL = 'https://everestmebli.com.ua';
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'sonata');

async function ensureDir() {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
}

async function downloadImage(url: string, dest: string): Promise<boolean> {
    if (fs.existsSync(dest)) return true; // Already downloaded
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                console.error(`Failed to download ${url}: ${response.statusCode}`);
                return resolve(false);
            }
            const file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
        }).on('error', (err) => {
            console.error(`Error downloading ${url}:`, err.message);
            fs.unlink(dest, () => resolve(false));
            resolve(false);
        });
    });
}

async function getProductLinks(page: number): Promise<string[]> {
    console.log(`Fetching category page ${page}...`);
    const res = await fetch(`${BASE_URL}/collection/sonata?page=${page}`);
    const html = await res.text();

    // Find all product links
    const linkRegex = /href="https:\/\/everestmebli\.com\.ua\/product\/([^"]+)"/g;
    let match;
    const links = new Set<string>();
    while ((match = linkRegex.exec(html)) !== null) {
        links.add(`https://everestmebli.com.ua/product/${match[1]}`);
    }
    return Array.from(links);
}

async function scrapeProduct(url: string) {
    console.log(`Scraping product: ${url}`);
    const res = await fetch(url);
    const html = await res.text();

    // Look for image sources
    // <div class="f-carousel__slide" data-thumb-src="/storage/products/X/Y/11222_01.jpg">
    // Usually thumbnail is _01.jpg, but we want the high-res one if available, 
    // or we just fetch the main src. Wait, the main image might be in `src=` or `href=` of an anchor.
    // Let's use `data-thumb-src` or `src` inside the gallery.

    const imgRegex = /src="(\/storage\/products\/[^"]+)"/g;
    let match;
    const imageUrls = new Set<string>();

    while ((match = imgRegex.exec(html)) !== null) {
        // filter out small thumbs if possible, but Everest often just uses one size or we can try replacing "thumb" paths if any
        imageUrls.add(BASE_URL + match[1]);
    }

    const images = Array.from(imageUrls);
    if (images.length === 0) return;

    // Find SKU from the first image
    let sku = '';
    for (const img of images) {
        const skuMatch = img.match(/\/(\d+)_/);
        if (skuMatch) {
            sku = skuMatch[1];
            break;
        }
    }

    if (!sku) {
        // Try finding SKU from DOM text 
        const domSkuMatch = html.match(/>(\d{4,5})</);
        if (domSkuMatch) sku = domSkuMatch[1];
    }

    if (!sku) {
        console.log(`Could not find SKU for ${url}`);
        return;
    }

    console.log(`Found SKU ${sku} with ${images.length} images.`);

    // Match with database
    const product = await prisma.product.findUnique({
        where: { sku }
    });

    if (!product) {
        console.log(`Product with SKU ${sku} not found in local DB.`);
        return;
    }

    // Download images
    const localPaths: string[] = [];
    for (let i = 0; i < images.length; i++) {
        // Sort of guess extension
        const ext = path.extname(images[i].split('?')[0]) || '.jpg';
        const filename = `${sku}_0${i + 1}${ext}`;
        const destPath = path.join(UPLOAD_DIR, filename);

        await downloadImage(images[i], destPath);
        localPaths.push(`/uploads/sonata/${filename}`);
    }

    // Update DB
    await prisma.product.update({
        where: { id: product.id },
        data: {
            images: JSON.stringify(localPaths)
        }
    });
    console.log(`Updated images for SKU ${sku}`);
}

async function run() {
    await ensureDir();
    for (let page = 1; page <= 5; page++) {
        const links = await getProductLinks(page);
        if (links.length === 0) break;

        for (const link of links) {
            await scrapeProduct(link);
            // pause briefly to avoid rate limits
            await new Promise(r => setTimeout(r, 500));
        }
    }
    console.log('✅ Scraping completed!');
}

run()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
