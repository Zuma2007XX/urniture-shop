
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
dotenv.config();

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Connecting to DB...');

    // 1. Fetch all products in "Siti" collection
    const products = await prisma.product.findMany({
        where: {
            collection: {
                title: { contains: 'Сити' }
            }
        }
    });

    console.log(`Found ${products.length} products in "Siti" collection.`);

    const groups: Record<string, typeof products> = {};

    for (const p of products) {
        let baseName = p.name;

        // Normalize
        baseName = baseName.replace(/×/g, 'x');

        // Strategy: Strip known colors to get base name
        // Colors from user request/image: "сонома/білий", "сонома/графіт"
        // In scraped names: "Сонома + Білий", "Сонома + Графіт"
        const colorsToRemove = [
            "Сонома + Білий",
            "Сонома + Графіт",
            "Сонома + білий",
            "Сонома + графіт",
            "Сонома + Графит" // Typo in source
        ];

        for (const color of colorsToRemove) {
            const regex = new RegExp(color.replace(/\+/g, '\\+'), 'gi');
            baseName = baseName.replace(regex, '');
        }

        // Additional Normalization for Citi
        if (baseName.includes("Ліжко двоспальне EVEREST Сіті каркас 1600")) {
            baseName = "Ліжко двоспальне EVEREST Сіті каркас 1600 щит ДСП";
        }

        baseName = baseName.trim();
        baseName = baseName.replace(/[\+\-]$/, '').trim();

        if (!groups[baseName]) {
            groups[baseName] = [];
        }
        groups[baseName].push(p);
    }

    // 3. Assign Series ID
    for (const [baseName, group] of Object.entries(groups)) {
        if (group.length < 2) {
            console.log(`Single product group: "${baseName}" - Skipping series assignment.`);
            continue;
        }

        const slug = baseName
            .toLowerCase()
            .replace(/everest/g, '')
            .replace(/сіті/g, '') // Ukr
            .replace(/siti/g, '') // Eng
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const seriesId = `siti-${slug}-${Date.now()}`;

        console.log(`Linking ${group.length} products as series: ${seriesId} (${baseName})`);

        for (const p of group) {
            await prisma.product.update({
                where: { id: p.id },
                data: { series: seriesId }
            });
            // console.log(`  - Updated ${p.name}`);
        }
    }

    console.log('Done.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
