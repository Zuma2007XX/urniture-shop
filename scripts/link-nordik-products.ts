
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

    // 1. Fetch all products in "Nordik" collection
    const products = await prisma.product.findMany({
        where: {
            collection: {
                title: { contains: 'Нордік' }
            }
        }
    });

    console.log(`Found ${products.length} products in "Nordik" collection.`);

    const groups: Record<string, typeof products> = {};

    for (const p of products) {
        let baseName = p.name;

        // Normalize multiplication symbol
        baseName = baseName.replace(/×/g, 'x');

        // Strategy: Strip known colors to get base name
        // Colors: "Дуб крафт золотий + Білий", "Дуб крафт золотий + Графіт"
        const colorsToRemove = [
            "Дуб крафт золотий + Білий",
            "Дуб крафт золотий + Графіт",
            "Дуб крафт золотий + білий",
            "Дуб крафт золотий + графіт",
            "Дуб Крафт Золотий Білий", // Missing +
            "Дуб Крафт Золотий Графіт"
        ];

        for (const color of colorsToRemove) {
            // Case insensitive replace
            const regex = new RegExp(color.replace(/\+/g, '\\+'), 'gi');
            baseName = baseName.replace(regex, '');
        }

        // Additional Normalization
        baseName = baseName.replace('2 дверці', 'дверця'); // Unify description
        baseName = baseName.replace('380х530', '378х530'); // Unify dimensions typo
        baseName = baseName.replace('і дверця', 'і 2 дверця'); // Unify "4 шухляди і дверця" vs "4 шухляди і 2 дверці" -> "4 шухляди і 2 дверця"

        // Wait, "4 шухляди і дверця" -> "4 шухляди і 2 дверця"
        // "4 шухляди і 2 дверці" -> "4 шухляди і 2 дверця" (via replace 2 дверці -> дверця => "4 шухляди і 2 дверця" then replace "і 2 дверця"?)

        // Simplify: just remove the description part if it causes issues?
        // Or strictly map:
        if (baseName.includes("Комоди Нордік 1400")) {
            // Force base name
            baseName = "Комоди Нордік 1400 4 шухляди і 2 дверця";
        }

        baseName = baseName.trim();
        // Remove trailing hyphen or plus if any (unlikely with accurate replacement)
        baseName = baseName.replace(/[\+\-]$/, '').trim();


        // Debug logging
        // console.log(`'${p.name}' -> '${baseName}'`);

        if (!groups[baseName]) {
            groups[baseName] = [];
        }
        groups[baseName].push(p);
    }

    // 3. Assign Series ID
    for (const [baseName, group] of Object.entries(groups)) {
        if (group.length < 2) {
            console.log(`Single product group: "${baseName}" - Skipping series assignment.`);
            // check if it needs self-assignment? usually no.
            // But if we want hover to work even if there are no other variants (to show self?), no.
            // If there is really only 1 product, no hover needed.
            continue;
        }

        const slug = baseName
            .toLowerCase()
            .replace(/everest/g, '')
            .replace(/нордік/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const seriesId = `nordik-${slug}-${Date.now()}`;

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
