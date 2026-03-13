import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('Refining SeriousM position and removing EVEREST...');

    const products: any[] = await prisma.$queryRaw`SELECT id, name, description FROM Product`;

    let updateCount = 0;

    for (const p of products) {
        let changed = false;
        let name = p.name.replace(/SeriousM/gi, '').replace(/\s+/g, ' ').trim();
        let desc = p.description || '';

        // 1. Clear EVEREST
        const brandRegex = /\b(EVEREST|Еверест|Эверест)\b/gi;
        if (brandRegex.test(name) || brandRegex.test(desc)) {
            name = name.replace(brandRegex, '').replace(/\s+/g, ' ').trim();
            desc = desc.replace(brandRegex, 'SeriousM').replace(/\s+/g, ' ').trim();
            changed = true;
        }

        // 2. Reposition SeriousM
        let newName = name;
        if (name.includes('Соната')) {
            newName = name.replace('Соната', 'SeriousM Соната');
        } else if (name.includes('Бріз')) {
            newName = name.replace('Бріз', 'Бріз SeriousM');
        } else if (name.includes('Сіті')) {
            newName = name.replace('Сіті', 'SeriousM Сіті');
        } else if (name.includes('Стайл')) {
            newName = name.replace('Стайл', 'SeriousM Стайл');
        } else {
            // Default: after first word
            const parts = name.split(' ');
            parts.splice(1, 0, 'SeriousM');
            newName = parts.join(' ');
        }

        newName = newName.replace(/SeriousM SeriousM/g, 'SeriousM').replace(/\s+/g, ' ').trim();

        if (newName !== p.name || desc !== p.description) {
            await prisma.$executeRaw`
                UPDATE Product 
                SET name = ${newName}, 
                    description = ${desc}
                WHERE id = ${p.id}
            `;
            updateCount++;
        }
    }

    console.log(`Successfully refined ${updateCount} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
