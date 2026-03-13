import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    const products = await prisma.product.findMany({
        where: {
            series: {
                contains: '-'
            }
        },
        select: {
            id: true,
            name: true,
            series: true,
        },
        take: 10
    });
    console.log(products);
}
main().catch(console.error);
