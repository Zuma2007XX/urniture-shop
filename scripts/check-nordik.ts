import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    const products = await prisma.product.findMany({
        where: { name: { contains: 'Нордік' } },
        select: { id: true, name: true, price: true }
    });
    console.log(products.map(p => `${p.name} - ${p.price}`).join('\n'));
}

main().catch(console.error);
