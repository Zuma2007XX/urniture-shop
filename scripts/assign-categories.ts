
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

// Mapping rules based on src/lib/constants.ts
const CATEGORY_RULES = [
    { slug: 'single_beds', keywords: ['ліжко односпальне', 'односпальне ліжко', 'ліжко 80', 'ліжко 90', 'ліжко 800', 'ліжко 900'] },
    { slug: 'double_beds', keywords: ['ліжко двоспальне', 'двоспальне ліжко', 'ліжко 140', 'ліжко 160', 'ліжко 180', 'ліжко 1400', 'ліжко 1600', 'ліжко 1800'] },
    { slug: 'bedside_tables', keywords: ['тумба приліжкова', 'приліжкова тумба', 'тумба нічна'] },
    { slug: 'shoe_cabinets', keywords: ['тумба під взуття', 'тумба для взуття', 'взуттєва тумба', 'тумба взуттєва', 'тумба то', 'тумба т-'] },
    { slug: 'tv_stands', keywords: ['тумба під тв', 'тумба тв', 'тумба під телевізор'] },
    { slug: 'commodes', keywords: ['комод'] },
    { slug: 'wardrobes', keywords: ['шафа', 'шкаф'] },
    { slug: 'coffee_tables', keywords: ['стіл журнальний', 'журнальний столик', 'столик журнальний'] },
    { slug: 'computer_desks', keywords: ['стіл комп', 'стіл письмовий', 'комп\'ютерний стіл', 'письмовий стіл'] },
    { slug: 'tables', keywords: ['стіл обідній', 'обідній стіл', 'стіл кухонний'] }, // Generic tables if not above
    { slug: 'wall_hangers', keywords: ['вішалка настінна', 'настінна вішалка', 'вішалка з полицею'] },
    { slug: 'floor_hangers', keywords: ['вішалка напольна', 'напольна вішалка', 'стійка для одягу', 'вішалка'] }, // Fallback for hangers if not wall
    { slug: 'mirrors', keywords: ['дзеркало'] },
    { slug: 'pencil_cases', keywords: ['пенал'] },
    { slug: 'shelves', keywords: ['полиця', 'поличка'] },
    { slug: 'wall_units', keywords: ['вітальня', 'стінка'] },
    { slug: 'chairs', keywords: ['крісло', 'стілець'] },
    { slug: 'sofas', keywords: ['диван'] },
];

async function main() {
    console.log('Starting category assignment...');

    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products total.`);

    let updatedCount = 0;

    for (const product of products) {
        const nameLower = product.name.toLowerCase();
        let matchedSlug = null;

        // Try to find a matching category
        for (const rule of CATEGORY_RULES) {
            if (rule.keywords.some(k => nameLower.includes(k))) {
                matchedSlug = rule.slug;
                break; // Stop at first match (order matters in rules array!)
            }
        }

        // Special logic for generic 'bed' if not caught by size
        if (!matchedSlug && nameLower.includes('ліжко')) {
            if (nameLower.includes('140') || nameLower.includes('160') || nameLower.includes('180') || nameLower.includes('1400') || nameLower.includes('1600') || nameLower.includes('1800')) {
                matchedSlug = 'double_beds';
            } else {
                matchedSlug = 'single_beds'; // Default assumption or fallback
            }
        }

        if (matchedSlug && matchedSlug !== product.category) {
            console.log(`Updating "${product.name}": ${product.category || 'NONE'} -> ${matchedSlug}`);
            await prisma.product.update({
                where: { id: product.id },
                data: { category: matchedSlug }
            });
            updatedCount++;
        }
    }

    console.log(`Done. Updated ${updatedCount} products.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
