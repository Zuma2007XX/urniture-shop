import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
  const allProducts = await prisma.product.findMany();
  const withDescription = allProducts.filter(p => p.description && p.description.trim().length > 0);
  const withoutDescription = allProducts.filter(p => !p.description || p.description.trim().length === 0);

  console.log(`Total products: ${allProducts.length}`);
  console.log(`With description: ${withDescription.length}`);
  console.log(`Without description: ${withoutDescription.length}`);

  // Print first few without description
  console.log('\nSample without description:');
  withoutDescription.slice(0, 5).forEach(p => console.log(`- ${p.name} (SKU: ${p.sku})`));

  // Print a sample of existing descriptions to see current formatting
  console.log('\nSample with description:');
  withDescription.slice(0, 3).forEach(p => console.log(`- ${p.name}:\n  ${p.description?.substring(0, 100)}...`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
