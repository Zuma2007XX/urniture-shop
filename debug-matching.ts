
import { PrismaClient } from '@prisma/client';

// --- INLINED UTILS START ---
// Remove all non-alphanumeric chars and lowercase, and normalize homoglyphs
const normalizeProductString = (s: string) => {
    let str = s.toLowerCase();

    // Replace Latin homoglyphs with Cyrillic
    const homoglyphs: Record<string, string> = {
        'a': 'а', 'c': 'с', 'e': 'е', 'i': 'і', 'o': 'о', 'p': 'р', 'x': 'х', 'y': 'у',
        'h': 'н', 'k': 'к', 'b': 'в', 'm': 'м', 't': 'т'
    };

    str = str.replace(/[aceiopxyhkbmt]/g, m => homoglyphs[m]);

    return str.replace(/[^a-zа-я0-9]/g, '');
};

const isColorMatching = (productName: string, colorName: string) => {
    const normalize = normalizeProductString;
    const target = normalize(colorName);
    const sNameObj = normalize(productName);

    // 1. Try simple inclusion
    if (sNameObj.includes(target)) return true;

    // 2. Token matching with translation support
    const translations: Record<string, string> = {
        'белый': 'білий', 'білий': 'белый',
        'темный': 'темний', 'темний': 'темный',
        'светлый': 'світлий', 'світлий': 'светлый',
        'орех': 'горіх', 'горіх': 'орех',
        'дуб': 'дуб',
        'сонома': 'сонома',
        'венге': 'венге',
        'антрацит': 'антрацит',
        'сірий': 'серый', 'серый': 'сірий',
        'альба': 'альба',
        'трюфель': 'трюфель',
        'клондайк': 'клондайк',
        'крафт': 'крафт',
        'золотой': 'золотий', 'золотий': 'золотой',
        'зеленый': 'зелений', 'зелений': 'зеленый',
        'кашемір': 'кашемир', 'кашемир': 'кашемір',
        'бетон': 'бетон',
        'графіт': 'графит', 'графит': 'графіт',
    };

    const tokens = colorName.toLowerCase().split(/[\s\-\+]+/);

    // Check if every token matches (either direct or translated)
    return tokens.every(t => {
        const normT = normalize(t);
        if (!normT) return true; // skip empty tokens

        // Direct match check
        if (sNameObj.includes(normT)) return true;

        // Translation check
        const translated = translations[t] || translations[normT];
        if (translated && sNameObj.includes(normalize(translated))) return true;

        return false;
    });
};
// --- INLINED UTILS END ---

import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

// ... (existing code)

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Fetch products that might be involved (Lite series)
    const products = await prisma.product.findMany({
        where: {
            name: {
                contains: 'Лайт'
            }
        }
    });

    console.log(`Found ${products.length} products in 'Лайт' series/name`);

    // Group by series to mimic frontend behavior
    const seriesMap: Record<string, typeof products> = {};
    products.forEach(p => {
        const s = p.series || 'unknown';
        if (!seriesMap[s]) seriesMap[s] = [];
        seriesMap[s].push(p);
    });

    for (const series of Object.keys(seriesMap)) {
        console.log(`\n--- Series: ${series} ---`);
        const siblings = seriesMap[series];

        for (const p of siblings) {

            // Focus on Graphite products first
            if (!p.name.toLowerCase().includes('графіт') && !p.name.toLowerCase().includes('графит')) {
                // continue; // Uncomment to focus
            }

            console.log(`\nProd: "${p.name}" (ID: ${p.id})`);

            // Check its colors
            let specs;
            try {
                specs = p.specifications ? JSON.parse(p.specifications) : null;
            } catch (e) {
                console.log('  Error parsing specs');
                continue;
            }

            if (specs?.colors) {
                for (const color of specs.colors) {
                    // Only care about Sonoma hover
                    if (!color.name.toLowerCase().includes('сонома')) continue;

                    console.log(`  Color: "${color.name}"`);

                    const matches = siblings.filter(sibling => {
                        const match = isColorMatching(sibling.name, color.name);
                        return match;
                    });

                    if (matches.length > 0) {
                        matches.forEach(m => console.log(`    MATCHED: "${m.name}"`));
                    } else {
                        console.log(`    NO MATCH found.`);
                    }
                }
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
