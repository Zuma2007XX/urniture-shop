import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('Restoring Brand "SeriousM" and removing "EVEREST"...');

    const products: any[] = await prisma.$queryRaw`SELECT id, name, description, specifications FROM Product`;

    let updateCount = 0;

    for (const p of products) {
        let changed = false;
        let newName = p.name;
        let newDesc = p.description || '';

        // 1. Remove EVEREST / Еверест / Эверест and ensure SeriousM is present
        const brandRegex = /\b(EVEREST|Еверест|Эверест)\b/gi;

        if (brandRegex.test(newName) || brandRegex.test(newDesc)) {
            newName = newName.replace(brandRegex, 'SeriousM');
            newDesc = newDesc.replace(brandRegex, 'SeriousM');
            changed = true;
        }

        // 2. If name doesn't have "SeriousM", try to put it back in a sensible place
        if (!newName.includes('SeriousM')) {
            // Usually it goes after the first word like "Комод SeriousM"
            // or after category + subtype like "Ліжко Бріз SeriousM"
            const parts = newName.split(' ');
            if (parts.length >= 2) {
                if (['Бріз', 'Соната', 'Сіті', 'Стайл'].includes(parts[1])) {
                    parts.splice(2, 0, 'SeriousM');
                } else {
                    parts.splice(1, 0, 'SeriousM');
                }
                newName = parts.join(' ');
            } else {
                newName = 'SeriousM ' + newName;
            }
            changed = true;
        }

        // Ensure no double SeriousM
        if (newName.includes('SeriousM SeriousM')) {
            newName = newName.replace(/SeriousM SeriousM/g, 'SeriousM');
            changed = true;
        }

        if (changed) {
            await prisma.$executeRaw`
                UPDATE Product 
                SET name = ${newName}, 
                    description = ${newDesc}
                WHERE id = ${p.id}
            `;
            updateCount++;
        }
    }

    console.log(`Successfully updated ${updateCount} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
