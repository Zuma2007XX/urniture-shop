
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const CATEGORY_MAP = {
    "commodes": "cmlmsridf0000vrriwa0gyhj9", // Комоди
    "wardrobes": "cmlmsridm0001vrriyvn9al7q", // Шафи розпашні
    "pencil_cases": "cmlmsridn0002vrrixy72a0rc", // Пенали
    "bedside_tables": "cmlmsrido0003vrri2e07gjyx", // Тумби приліжкові
    "computer_desks": "cmlmsridp0004vrri2huy3nl6", // Столи комп'ютерні
    "wall_hangers": "cmlmsridp0005vrriuabgdcdr", // Вішалки настінні
    "floor_hangers": "cmlmsridq0006vrrizssdlczy", // Вішалки напольні
    "wall_units": "cmlmsrids0009vrrinf2885fb", // Стінки
    "single_beds": "cmlmsridv000cvrri6k56oqvx", // Ліжка односпальні
    "double_beds": "cmlmsridw000dvrrir1wwpbor", // Ліжка двоспальні
    "mirrors": "cmlmsridw000evrrifj8fdr7l", // Дзеркала
    "tables": "cmlmsridy000gvrriytgze1vz", // Столи
};

function normalize(str: string) {
    return str.toLowerCase().replace(/ё/g, 'е').replace(/-/g, ' ');
}

async function main() {
    const products = await prisma.product.findMany({
        where: {
            // Filter by Briz collection ID or name if collection link missing
            OR: [
                { collectionId: 'cmlm5rd6w0007horiqiqglwhd' },
                { name: { contains: 'Бріз' } }
            ]
        }
    });

    console.log(`Found ${products.length} Briz products to categorize.`);

    let updated = 0;

    for (const product of products) {
        const name = normalize(product.name);
        let categoryId = '';
        let categorySlug = '';

        // Helper for whole word/token match
        const hasToken = (token: string) => new RegExp(`(?:^|\\s)${token}(?:\\s|$)`).test(name);

        if (name.includes('стіл') || name.includes('школяр') || name.includes('надбудова')) {
            categoryId = CATEGORY_MAP.computer_desks;
            categorySlug = 'computer_desks';
        } else if (name.includes('ліжко') || name.includes('асторія') || name.includes('комфорт')) {
            // Check size or default to double
            if (name.includes('800') || name.includes('900') || name.includes('840') || name.includes('853')) {
                categoryId = CATEGORY_MAP.single_beds;
                categorySlug = 'single_beds';
            } else {
                categoryId = CATEGORY_MAP.double_beds;
                categorySlug = 'double_beds';
            }
        } else if (name.includes('тумба приліжкова') || hasToken('т 1') || hasToken('t 1')) {
            // Strict check for T-1 to avoid "komforT 1..."
            categoryId = CATEGORY_MAP.bedside_tables;
            categorySlug = 'bedside_tables';
        } else if (name.includes('комод') || hasToken('к 5') || hasToken('к 6')) {
            categoryId = CATEGORY_MAP.commodes;
            categorySlug = 'commodes';
        } else if (name.includes('пенал') || hasToken('бріз 15') || hasToken('бріз 17')) {
            categoryId = CATEGORY_MAP.pencil_cases;
            categorySlug = 'pencil_cases';
        } else if (name.includes('шафа') || name.includes('шку') || name.includes('шп')) {
            categoryId = CATEGORY_MAP.wardrobes;
            categorySlug = 'wardrobes';
        } else if (name.includes('вішалка')) {
            if (name.includes('підлогова')) {
                categoryId = CATEGORY_MAP.floor_hangers;
                categorySlug = 'floor_hangers';
            } else {
                categoryId = CATEGORY_MAP.wall_hangers;
                categorySlug = 'wall_hangers';
            }
        } else if (name.includes('стінка')) {
            categoryId = CATEGORY_MAP.wall_units;
            categorySlug = 'wall_units';
        } else if (name.includes('дзеркало') || name.includes('трюмо')) {
            categoryId = CATEGORY_MAP.mirrors;
            categorySlug = 'mirrors';
        }

        if (categoryId) {
            console.log(`Updating "${product.name}" -> ${categorySlug}`);
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    categoryId: categoryId,
                    // Also update legacy string field if needed, or leave 'briz'?
                    // Frontend might use 'category' string for filtering in some places?
                    // Let's update it to the slug or name. 
                    // Schema says `category String`. Before it was 'briz'.
                    // Let's set it to categorySlug for consistency with other parts if they use slugs.
                    category: categorySlug
                }
            });
            updated++;
        } else {
            console.log(`SKIPPING: No category match for "${product.name}"`);
        }
    }

    console.log(`Updated ${updated} products.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
