import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    const products = await prisma.product.findMany({
        where: { name: { contains: 'Нордік' } },
        select: { id: true, name: true, price: true }
    });

    for (const product of products) {
        let newPrice = null;

        if (product.name.includes('Ліжко')) {
            if (product.name.includes('1400')) {
                const base = 3635;
                const lamels = 3584;
                const lift = 1866;
                const board = 2723;
                const dno = 779;

                if (product.name.includes('підйомним механізмом')) {
                    newPrice = base + lamels + lift + dno;
                } else if (product.name.includes('ламельною основою') || product.name.includes('ламельний каркас')) {
                    newPrice = base + lamels;
                } else if (product.name.includes('щит ДСП')) {
                    newPrice = base + board;
                } else {
                    newPrice = base; // just the frame "Ліжко двоспальне SeriousM Нордік 1400 Дуб Крафт Золотий"
                }
            } else if (product.name.includes('1600')) {
                const base = 3898;
                const lamels = 3716;
                const lift = 1866;
                const board = 2986;
                const dno = 890;

                if (product.name.includes('підйомним механізмом')) {
                    newPrice = base + lamels + lift + dno;
                } else if (product.name.includes('ламельною основою') || product.name.includes('ламельний каркас')) {
                    newPrice = base + lamels;
                } else if (product.name.includes('щит ДСП')) {
                    newPrice = base + board;
                } else {
                    newPrice = base; // just the frame
                }
            }
        }

        if (newPrice !== null && newPrice !== product.price) {
            console.log(`Updating ${product.name}: ${product.price} -> ${newPrice}`);
            await prisma.product.update({
                where: { id: product.id },
                data: { price: newPrice }
            });
        }
    }
}

main().catch(console.error);
