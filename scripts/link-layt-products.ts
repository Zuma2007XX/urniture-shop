
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

    // 1. Fetch all products in "Layt" collection
    const products = await prisma.product.findMany({
        where: {
            collection: {
                title: { contains: 'Лайт' }
            }
        }
    });

    console.log(`Found ${products.length} products in "Layt" collection.`);

    const groups: Record<string, typeof products> = {};

    for (const p of products) {
        let baseName = p.name;

        // Normalize
        baseName = baseName.replace(/×/g, 'x');

        // Pre-normalization
        baseName = baseName.replace(/&nbsp;/g, ' '); // Replace literal &nbsp;
        baseName = baseName.replace(/\u00A0/g, ' '); // Replace NBSP char
        baseName = baseName.replace(/20801мм/g, '2080мм'); // Fix dimension typo
        baseName = baseName.replace(/Cонома/g, 'Сонома'); // Latin C
        baseName = baseName.replace(/Графит/g, 'Графіт'); // Typo i -> i
        baseName = baseName.replace(/\s*\+\s*/g, ' + '); // Normalize plus spacing

        // Specific fix for Bed 1400 Frame
        // "Ліжко двоспальне каркас EVEREST КЛ-1400 Лайт 1500х2120х940 мм" -> "Ліжко двоспальне каркас EVEREST Лайт КЛ-1400"
        if (baseName.includes("Ліжко двоспальне каркас EVEREST КЛ-1400 Лайт")) {
            baseName = "Ліжко двоспальне каркас EVEREST Лайт КЛ-1400";
        }

        // Colors to remove: "сонома", "німфея альба", "ГРАФІТ", "дуб КРАФТ білий"
        // In logs: "Графіт", "Крафт Білий", "Німфея Альба", "Сонома"
        const colorsToRemove = [
            "Крафт Білий",
            "Німфея Альба",
            "Графіт",
            "Сонома",
            "Дуб Крафт Білий" // Just in case
        ];

        for (const color of colorsToRemove) {
            const regex = new RegExp(color.replace(/\+/g, '\\+'), 'gi');
            baseName = baseName.replace(regex, '');
        }

        // Clean up
        baseName = baseName.replace(/\s+/g, ' ').trim();
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
            .replace(/лайт/g, '')
            .replace(/layt/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const seriesId = `layt-${slug}-${Date.now()}`;

        console.log(`Linking ${group.length} products as series: ${seriesId} (${baseName})`);

        for (const p of group) {
            await prisma.product.update({
                where: { id: p.id },
                data: { series: seriesId }
            });
        }
    }

    console.log('Done.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
