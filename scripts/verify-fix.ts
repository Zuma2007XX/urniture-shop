import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    const products: any[] = await prisma.$queryRaw`
      SELECT id, name, sku, description, specifications 
      FROM Product 
      WHERE name LIKE '%Асторія-2%' OR sku = '11269' OR name LIKE '%Сіті 1600%'
  `;

    console.log('--- Verification of Fixed Products ---');
    products.forEach(p => {
        console.log(`Name: ${p.name}`);
        console.log(`SKU: ${p.sku}`);
        console.log(`Desc: ${p.description}`);
        console.log(`Has Specs: ${p.specifications && p.specifications !== '[]'}`);
        if (p.specifications) {
            const s = JSON.parse(p.specifications);
            console.log(`Dimensions: ${JSON.stringify(s.dimensions)}`);
            console.log(`Materials: ${JSON.stringify(s.materials)}`);
        }
        console.log('---');
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
