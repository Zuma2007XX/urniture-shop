import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const PRODUCT_CATEGORIES = [
    { id: "commodes", name: "Комоди" },
    { id: "wardrobes", name: "Шафи розпашні" },
    { id: "pencil_cases", name: "Пенали" },
    { id: "bedside_tables", name: "Тумби приліжкові" },
    { id: "computer_desks", name: "Столи комп'ютерні" },
    { id: "wall_hangers", name: "Вішалки настінні" },
    { id: "floor_hangers", name: "Вішалки напольні" },
    { id: "shoe_cabinets", name: "Тумби під взуття" },
    { id: "tv_stands", name: "Тумби під ТВ" },
    { id: "wall_units", name: "Стінки" },
    { id: "coffee_tables", name: "Столи журнальні" },
    { id: "shelves", name: "Полиці" },
    { id: "single_beds", name: "Ліжка односпальні" },
    { id: "double_beds", name: "Ліжка двоспальні" },
    { id: "mirrors", name: "Дзеркала" },
    { id: "chairs", name: "Крісла" },
    { id: "tables", name: "Столи" },
    { id: "sofas", name: "Дивани" },
    { id: "lamps", name: "Лампи" },
    { id: "decor", name: "Декор" },
];

async function main() {
    console.log('Starting category migration...');

    // 1. Upsert Categories
    for (const cat of PRODUCT_CATEGORIES) {
        await prisma.category.upsert({
            where: { slug: cat.id },
            update: { name: cat.name },
            create: {
                slug: cat.id,
                name: cat.name,
            },
        });
        console.log(`Upserted category: ${cat.name} (${cat.id})`);
    }

    // Also enable "all" category? No, "all" is usually a virtual category in UI.
    // But let's check if there are other categories used in Product that are not in constants.

    // 2. Link Products to Categories
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products to link.`);

    for (const product of products) {
        if (!product.category) continue;

        // Find matching category by slug
        // Try exact match first
        let category = await prisma.category.findUnique({
            where: { slug: product.category },
        });

        // If not found, maybe it's a legacy ID? 
        // For now, assume product.category holds the slug (id from constants).

        if (category) {
            await prisma.product.update({
                where: { id: product.id },
                data: { categoryId: category.id },
            });
            // process.stdout.write('.');
        } else {
            console.warn(`Warning: Product ${product.name} has unknown category '${product.category}'`);

            // Optional: Create it?
            // await prisma.category.create({ data: { slug: product.category, name: product.category } })
        }
    }

    console.log('\nMigration completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
