
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
dotenv.config();

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

function normalize(str: string) {
    return str.toLowerCase().replace(/ё/g, 'е').replace(/-/g, ' ').trim();
}

async function main() {
    console.log('Connecting to DB...');

    // 1. Fetch all products in "Style" collection
    const products = await prisma.product.findMany({
        where: {
            collection: {
                title: { contains: 'Стайл' }
            }
        }
    });

    console.log(`Found ${products.length} products in "Style" collection.`);

    // 2. Group by base name
    // Name format: "Type Name Dimensions Color+Color"
    // e.g. "Комод EVEREST Стайл 1602x390x754 мм Кашемір + Канелла"
    // Base Name: "Комод EVEREST Стайл 1602x390x754 мм"

    const groups: Record<string, typeof products> = {};

    for (const p of products) {
        // Simple heuristic: Split by "мм"
        // If "мм" exists, take everything before it + "мм".
        // If not, take distinct words?

        let baseName = p.name;
        // Normalize multiplication symbol
        let name = p.name.replace(/×/g, 'x'); // Replace custom cross with latin x

        if (name.includes('мм')) {
            const parts = name.split('мм');
            baseName = parts[0].trim() + ' мм';
        } else {
            console.warn(`Warning: Product "${p.name}" does not contain "мм". Using full name as base.`);
            baseName = name;
        }

        // Normalize variations
        if (baseName.includes('Тумба приліжкова')) {
            baseName = baseName.replace('Тумба приліжкова', 'Приліжкова тумба');
        }

        if (!groups[baseName]) {
            groups[baseName] = [];
        }
        groups[baseName].push(p);
    }

    // 3. Assign Series ID
    for (const [baseName, group] of Object.entries(groups)) {
        if (group.length < 2) {
            console.log(`Single product group: "${baseName}" - Skipping series assignment (or should we assign self?)`);
            // It's good practice to assign series even for single products if we expect more variants later?
            // But usually series implies >1. 
            // However, linking logic requires series to be present to find *siblings*.
            // If only 1, no siblings.
            continue;
        }

        // Create a slug for the series
        // e.g. "style-komod-1600"
        // We can just use a sanitized version of baseName + hash?
        const slug = baseName
            .toLowerCase()
            .replace(/everest/g, '')
            .replace(/стайл/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const seriesId = `style-${slug}-${Date.now()}`; // Ensure uniqueness

        console.log(`Linking ${group.length} products as series: ${seriesId} (${baseName})`);

        for (const p of group) {
            await prisma.product.update({
                where: { id: p.id },
                data: { series: seriesId }
            });
            console.log(`  - Updated ${p.name}`);
        }
    }

    console.log('Done.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
