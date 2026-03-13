import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('Thoroughly replacing "EVEREST" with "SeriousM" in all fields...');

    const products: any[] = await prisma.$queryRaw`SELECT id, name, description, specifications FROM Product`;

    let updateCount = 0;

    const brandRegex = /\b(EVEREST|Еверест|Эверест)\b/gi;

    for (const p of products) {
        let changed = false;
        let newName = p.name || '';
        let newDesc = p.description || '';
        let newSpecs = p.specifications || '';

        if (brandRegex.test(newName)) {
            newName = newName.replace(brandRegex, 'SeriousM');
            changed = true;
        }

        if (brandRegex.test(newDesc)) {
            newDesc = newDesc.replace(brandRegex, 'SeriousM');
            changed = true;
        }

        if (brandRegex.test(newSpecs)) {
            newSpecs = newSpecs.replace(brandRegex, 'SeriousM');
            changed = true;
        }

        // Clean up double brand names just in case
        if (changed) {
            newName = newName.replace(/SeriousM\s+SeriousM/g, 'SeriousM').replace(/\s+/g, ' ').trim();
            newDesc = newDesc.replace(/SeriousM\s+SeriousM/g, 'SeriousM').replace(/\s+/g, ' ').trim();

            // Re-ensure SeriousM is in name if it was only EVEREST before
            if (!newName.includes('SeriousM')) {
                newName = 'SeriousM ' + newName;
            }

            await prisma.$executeRaw`
                UPDATE Product 
                SET name = ${newName}, 
                    description = ${newDesc},
                    specifications = ${newSpecs}
                WHERE id = ${p.id}
            `;
            updateCount++;
        }
    }

    console.log(`Successfully updated ${updateCount} products with thorough brand replacement.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
