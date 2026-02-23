
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
dotenv.config();

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

// Templates for different product types
const TEMPLATES: Record<string, string[]> = {
    bed: [
        "Сучасне двоспальне ліжко {Name} з колекції {Collection}. Надійна конструкція забезпечує комфортний сон та довговічність. Стильний дизайн у кольорі {Color} ідеально доповнить інтер'єр вашої спальні. Доступні розміри спального місця: {Dimensions}.",
        "Ліжко {Name} — це поєднання естетики та функціональності. Модель із серії {Collection} виконана з якісних матеріалів. Лаконічні форми та трендовий колір {Color} створюють затишну атмосферу. Габарити: {Dimensions}.",
        "Оновіть свою спальню з ліжком {Name} від виробника Everest. Колекція {Collection} вирізняється продуманим дизайном. Міцний каркас та ортопедична основа (за наявності) гарантують здоровий сон. Розміри: {Dimensions}."
    ],
    chest: [
        "Місткий комод {Name} із серії {Collection} — практичне рішення для зберігання речей. Оснащений зручними шухлядами, що працюють плавно та безшумно. Колірне виконання {Color} додає інтер'єру сучасності. Розміри: {Dimensions}.",
        "Комод {Name} стане стильним акцентом у вашій кімнаті. Частина модульної системи {Collection}. Ідеально підходить для одягу, білизни та аксесуарів. Виконаний у кольорі {Color}. Габарити: {Dimensions}.",
        "Функціональний комод {Name} з колекції {Collection}. Поєднує в собі елегантність та зручність. Якісна фурнітура та надійні матеріали корпусу. Розміри: {Dimensions}. Колір: {Color}."
    ],
    wardrobe: [
        "Простора шафа {Name} із колекції {Collection} забезпечить порядок у вашому гардеробі. Продумана внутрішня організація дозволяє зручно розмістити одяг. Сучасний дизайн у кольорі {Color}. Габарити: {Dimensions}.",
        "Шафа {Name} від Everest — це ідеальне рішення для зберігання. Модель серії {Collection} вирізняється надійністю та стилем. Підходить для спальні, вітальні або передпокою. Розміри: {Dimensions}.",
        "Містка та стильна шафа {Name}. Частина модульної колекції {Collection}. Виконана в сучасному стилі {Color}, що легко інтегрується в будь-який інтер'єр. Розміри: {Dimensions}."
    ],
    desk: [
        "Письмовий стіл {Name} з колекції {Collection} — зручне робоче місце для дому чи офісу. Ергономічний дизайн та оптимальні розміри {Dimensions} сприяють продуктивності. Колір: {Color}.",
        "Стіл {Name} із серії {Collection} поєднує функціональність та стиль. Ідеально підходить для школяра, студента або домашнього кабінету. Виконаний у кольорі {Color}. Розміри: {Dimensions}."
    ],
    bedside: [
        "Тумба приліжкова {Name} — компактне та зручне доповнення до вашого ліжка. Елемент колекції {Collection}. Зручні шухляди для дрібниць. Колір: {Color}. Розміри: {Dimensions}.",
        "Стильна приліжкова тумба {Name} із серії {Collection}. Забезпечує комфорт та завершений вигляд спальної зони. Виконана у кольорі {Color}. Габарити: {Dimensions}."
    ],
    tvstand: [
        "Тумба під телевізор {Name} з колекції {Collection}. Сучасне рішення для вашої вітальні. Передбачено місце для техніки та аксесуарів. Колір: {Color}. Розміри: {Dimensions}.",
        "ТВ-тумба {Name} серії {Collection} — це стиль та функціональність. Міцна конструкція витримує навантаження. Стильне поєднання кольорів {Color}. Габарити: {Dimensions}."
    ],
    shelf: [
        "Полиця навісна {Name} з колекції {Collection}. Дозволяє ефективно використовувати простір стін. Ідеальна для книг та декору. Колір: {Color}. Розміри: {Dimensions}.",
        "Стильна полиця {Name} серії {Collection}. Додає інтер'єру завершеності та затишку. Легкий монтаж. Габарити: {Dimensions}."
    ],
    default: [
        "Меблі {Name} з колекції {Collection}. Сучасний дизайн, якісні матеріали та функціональність. Ідеально підходить для створення затишного інтер'єру. Колір: {Color}. Розміри: {Dimensions}.",
        "{Name} — надійний та стильний елемент меблевої системи {Collection} від Everest. Виконаний у кольорі {Color}, гармонійно поєднується з іншими предметами серії."
    ]
};

function detectType(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('ліжко')) return 'bed';
    if (n.includes('комод')) return 'chest';
    if (n.includes('шафа') || n.includes('шкаф')) return 'wardrobe';
    if (n.includes('стіл') || n.includes('стол')) return 'desk';
    if (n.includes('тумба приліжкова')) return 'bedside';
    if (n.includes('тумба під тв') || n.includes('тумба лтв') || n.includes('тумба тв')) return 'tvstand';
    if (n.includes('полиця') || n.includes('пенал')) return 'shelf';
    return 'default';
}

function extractDimensions(name: string): string {
    // Match pattern like 1400x530x2030 or 1400*530*2030 or 1400х530х2030
    const dimRegex = /(\d{3,4}[\sxх*]+\d{3,4}[\sxх*]+\d{3,4}(?:\s*мм)?)/i;
    const match = name.match(dimRegex);
    return match ? match[1] : '';
}

function extractColor(name: string): string {
    // Try to extract color from the end of the string
    // Usually color is after dimensions or at the very end
    // E.g. "Name Dimensions Color" or "Name Color"

    // Common colors in current DB
    const keywords = [
        "Сонома \\+ Білий", "Сонома \\+ Графіт", "Сонома",
        "Графіт", "Венге", "Береза", "Вільха", "Горіх",
        "Крафт Білий", "Крафт Сірий", "Крафт Золотий",
        "Німфея Альба", "Дуб Крафт", "Білий"
    ];

    for (const color of keywords) {
        const regex = new RegExp(color, 'i');
        if (regex.test(name)) {
            return color.replace(/\\/g, ''); // Return clean name
        }
    }
    return '';
}

function generateDescription(product: any, collectionTitle: string): string {
    const type = detectType(product.name);
    const templates = TEMPLATES[type] || TEMPLATES['default'];
    // Deterministic selection based on ID length or similar to vary but stay constant
    const templateIndex = product.id.length % templates.length;
    let text = templates[templateIndex];

    const dimensions = extractDimensions(product.name);
    const color = extractColor(product.name);

    // Clean name from dims and color for insertion
    let cleanName = product.name;
    // Don't strip too much, keeping full name is often safer for SEO/Context
    // But maybe strip specific technical suffix if needed.
    // For now, use robust replacement

    text = text.replace(/{Name}/g, cleanName);
    text = text.replace(/{Collection}/g, collectionTitle);
    text = text.replace(/{Color}/g, color ? color : 'сучасному');
    text = text.replace(/{Dimensions}/g, dimensions ? dimensions : 'дивіться характеристики');

    // Clean up empty placeholders if extraction failed
    text = text.replace(/\s\s+/g, ' ');

    return text;
}

async function main() {
    console.log('Generating descriptions...');

    // Target collections: Nordik, Citi, Layt, Style
    // Fetch all products where collection title matches
    const collections = await prisma.collection.findMany({
        where: {
            OR: [
                { title: { contains: 'Нордік' } },
                { title: { contains: 'Нордик' } },
                { title: { contains: 'Сити' } },
                { title: { contains: 'Сіті' } }, // Add Ukr spelling just in case
                { title: { contains: 'Лайт' } },
                { title: { contains: 'Стайл' } }
            ]
        },
        include: { products: true }
    });

    for (const col of collections) {
        console.log(`Processing collection: ${col.title} (${col.products.length} products)`);

        for (const p of col.products) {
            // Only update if description is generic or empty?
            // User asked to "create description", implying overwrite or improvement.
            // Let's overwrite to ensure uniformity.

            const newDesc = generateDescription(p, col.title);

            if (newDesc !== p.description) {
                await prisma.product.update({
                    where: { id: p.id },
                    data: { description: newDesc }
                });
                // console.log(`Updated ${p.sku}: ${newDesc.substring(0, 50)}...`);
            }
        }
    }

    console.log('Done.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
