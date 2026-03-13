import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('audit_report.json', 'utf8').split('--- AUDIT REPORT DATA ---')[1]);
const missing = data.missingTotal;

const groups = new Map();

missing.forEach(m => {
    // Try to remove color suffix
    const colorMatch = m.name.match(/\b(Венге темний|Сонома|Дуб крафт білий|Білий|Крафт золотий|Дуб крафт золотий|Венге темний \+ Білий|Сонома \+ Білий|Дуб \+ Крафт білий|Дуб крафт білий|Дуб крафт золотий)\b/i);
    let baseName = m.name;
    if (colorMatch) {
        baseName = m.name.replace(colorMatch[0], '').trim();
    }
    // Clean up extra spaces
    baseName = baseName.replace(/\s+/g, ' ').trim();

    if (!groups.has(baseName)) groups.set(baseName, []);
    groups.get(baseName).push(m);
});

console.log(`Unique product groups missing info: ${groups.size}`);
for (const [name, items] of groups.entries()) {
    console.log(`- ${name} (${(items as any[]).length} items, SKUs: ${(items as any[]).map(i => i.sku).join(', ')})`);
}
