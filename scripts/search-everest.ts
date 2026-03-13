import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('Searching for remaining EVEREST mentions...');

    // Search in name, description, and specifications
    const results: any[] = await prisma.$queryRaw`
        SELECT id, name, description 
        FROM Product 
        WHERE name LIKE '%EVEREST%' 
           OR name LIKE '%Еверест%' 
           OR name LIKE '%Эверест%'
           OR description LIKE '%EVEREST%'
           OR description LIKE '%Еверест%'
           OR description LIKE '%Эверест%'
           OR specifications LIKE '%EVEREST%'
           OR specifications LIKE '%Еверест%'
           OR specifications LIKE '%Эверест%'
    `;

    console.log(`Found ${results.length} products with old brand names.`);
    results.forEach(r => {
        console.log(`ID: ${r.id} | Name: ${r.name}`);
        // console.log(`  Desc: ${r.description}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
