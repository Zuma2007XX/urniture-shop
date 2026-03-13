import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    const products: any[] = await prisma.$queryRaw`
      SELECT id, name, description 
      FROM Product 
      WHERE name LIKE '%SeriousM%' OR description LIKE '%SeriousM%' OR name LIKE '%EVEREST%' OR description LIKE '%EVEREST%'
      LIMIT 10
  `;

    console.log('--- Branding Verification ---');
    products.forEach(p => {
        console.log(`Name: ${p.name}`);
        console.log(`Desc: ${p.description}`);
        console.log('---');
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
