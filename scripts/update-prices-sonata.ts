
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const PRICE_MAP: Record<string, number> = {
    "Дзеркало 800": 1254,
    "Комод 1": 2706,
    "Комод 2": 3323,
    "Комод 3": 3595,
    "Комод 4": 2536,
    "Комод 5": 3860,
    "Комод 7": 3956,
    "Комод 8": 4616,
    "Ліжко 1400": 5041,
    "Ліжко 1600": 5311,
    "Ліжко 900": 3461,
    "Надбудова стола": 1885, // Special handling
    "Пенал закритий": 2549, // Special handling
    "Пенал відкритий": 2471, // Special handling
    "Пуф": 630,
    "Стінка": 6268,
    "Стіл журнальний 910": 1229,
    "Стіл письмовий": 3233,
    "Тумба TV 1500": 2970, // Special handling
    "Тумба взуття 600": 1583, // "Тумба для взуття ... 600"
    "Тумба взуття 800": 3135,
    "Тумба приліжкова": 1453,
    "Шафа 1200": 6759,
    "Шафа 600": 3794,
    "Шафа 800": 5931,
    "Шафа кутова 700": 4781,
    "Щит вішалка 600": 1153,
    "Вішалка настінна 600": 1153, // Alias for Щит вішалка 600
    "Щит вішалка 800": 685,
    "Дзеркало шафа": 1198 // "ДЗЕРКАЛО для СОНАТА шафа"
};

function normalize(str: string) {
    return str.toLowerCase().replace(/ё/g, 'е');
}

function isMatch(productName: string, key: string): boolean {
    const pName = normalize(productName);
    const kName = normalize(key);

    // Debug specific failures
    const isDebug = pName.includes("стінка") || pName.includes("приліжкова");

    // 1. Special manual overrides
    if (key === "Надбудова стола" && (pName.includes("надставка") || pName.includes("надбудова"))) return true;
    if (key === "Пенал закритий" && pName.includes("закритий пенал")) return true;
    if (key === "Пенал відкритий" && pName.includes("відкритий пенал")) return true;
    if (key === "Тумба TV 1500" && (pName.includes("тв-1500") || pName.includes("tv 1500"))) return true;
    if (key === "Шафа кутова 700" && pName.includes("шафа") && pName.includes("кутова") && pName.includes("700")) return true;
    if (key === "Дзеркало шафа" && pName.includes("дзеркало") && pName.includes("шафа")) return true;
    // Handle "Тумба приліжкова" specifically if generic token matching fails? 
    // Actually generic token matching should work for "Тумба приліжкова".

    // 2. Default Token Matching
    const tokens = kName.split(' ');

    for (const token of tokens) {
        if (!token) continue;

        // If token is a number or "TV", use boundary/non-digit check
        if (/^\d+$/.test(token)) {
            // Match number surrounded by non-digits (or start/end of string)
            const regex = new RegExp(`(?:^|\\D)${token}(?:$|\\D)`);
            if (!regex.test(pName)) {
                if (isDebug && kName.includes("стінка")) console.log(`[Debug] '${pName}' failed number match '${token}'`);
                return false;
            }
        } else {
            // Text token: simple inclusion
            if (!pName.includes(token)) {
                if (isDebug) console.log(`[Debug] '${pName}' failed token match '${token}'`);
                return false;
            }
        }
    }

    return true;
}

async function main() {
    const products = await prisma.product.findMany({
        where: { name: { contains: 'Соната' } }
    });

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
        let matchedPrice: number | undefined;
        let matchedKey: string | undefined;

        // Prioritize some matches? No, order in PRICE_MAP is insertion order (mostly).
        // But "Шафа 800" vs "Щит вішалка 800".
        // "Шафа 800" check tokens "Шафа", "800". 
        // "Щит вішалка 800" check "Щит", "вішалка", "800".
        // Product "Щит вішалка ... 800".
        // Will it match "Шафа 800"? No, missing "Шафа".
        // Will "Шафа 800" match "Щит вішалка ..."? No.

        for (const [key, price] of Object.entries(PRICE_MAP)) {
            if (isMatch(product.name, key)) {
                matchedPrice = price;
                matchedKey = key;
                break;
            }
        }

        if (matchedPrice) {
            if (product.price !== matchedPrice) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { price: matchedPrice }
                });
                updatedCount++;
            } else {
                skippedCount++;
            }
        } else {
            console.log(`NO MATCH: "${product.name}"`);
        }
    }

    console.log(`Updated: ${updatedCount}, Skipped: ${skippedCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
