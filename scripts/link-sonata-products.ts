// @ts-nocheck
import Database from 'better-sqlite3';

const db = new Database('dev.db');

// Helper to slugify text for series ID
function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-\u0400-\u04FF]+/g, '') // Keep Cyrillic
        .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

console.log('Starting migration to link Sonata products...');

// 1. Fetch all Sonata products
const products = db.prepare("SELECT id, name FROM Product WHERE name LIKE '%Соната%'").all();
console.log(`Found ${products.length} products with 'Соната' in name.`);

const groups: Record<string, any[]> = {};

function getModelName(name: string) {
    // Regex to remove color parts
    // Strategy: Look for specific color keywords and everything after them
    const colorRegex = /[\s\-]*(Венге|Дуб|Сонома|Білий|Німфея|Горіх|Крафт).*/i;
    let cleanName = name.replace(colorRegex, '').trim();

    // Remove trailing separators
    cleanName = cleanName.replace(/[\-–—\s]+$/, '');

    return cleanName;
}

for (const p of products) {
    const modelName = getModelName(p.name);
    if (modelName) {
        if (!groups[modelName]) {
            groups[modelName] = [];
        }
        groups[modelName].push(p);
    } else {
        console.warn(`Could not determine model for: "${p.name}"`);
    }
}

// 3. Update products with series ID
const updateStmt = db.prepare("UPDATE Product SET series = ? WHERE id = ?");

const updateTx = db.transaction(() => {
    let count = 0;
    for (const [modelName, groupProducts] of Object.entries(groups)) {
        if (groupProducts.length < 2) {
            // Optional: if only 1 product, maybe don't set series? 
            // Or set it anyway for consistency? 
            // Let's set it anyway.
        }

        // Create slug
        let seriesId = slugify(modelName.replace(/EVEREST|Соната|Комод|Ліжко|Тумба|Шафа|Стіл|Надставка/gi, ''));
        // If slug becomes too empty (e.g. just numbers), prepend 'sonata-'
        if (!seriesId || seriesId.length < 3) {
            seriesId = 'sonata-' + slugify(modelName);
        } else {
            seriesId = 'sonata-' + seriesId;
        }
        // Cleanup slug
        seriesId = seriesId.replace(/^-+|-+$/g, '');

        console.log(`Grouping ${groupProducts.length} products under series '${seriesId}' (${modelName})`);

        for (const p of groupProducts) {
            updateStmt.run(seriesId, p.id);
            count++;
        }
    }
    console.log(`Updated ${count} products.`);
});

try {
    updateTx();
    console.log('Migration completed successfully!');
} catch (error) {
    console.error('Migration failed:', error);
}
