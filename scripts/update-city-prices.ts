import 'dotenv/config';
import prisma from '../src/lib/prisma';

const priceUpdates = [
    { match: 'Комод Сіті SeriousM 1150', price: 3811 },
    { match: 'Комод Сіті SeriousM 1500', price: 4451 },
    { match: 'Пенал Сіті SeriousM 400', price: 3116 },
    { match: 'Стіл Сіті SeriousM 1100', price: 3046 },
    { match: 'Міні-стіл Сіті SeriousM 750', price: 1516 },
    { match: 'Тумба для SeriousM взуття Сіті 160-2', price: 1669 },
    { match: 'Тумба приліжкова SeriousM Сіті 450', price: 1433 },
    { match: 'Шафа Сіті SeriousM 1200', price: 8095 },
    { match: 'Шафа Сіті SeriousM 1600', price: 9584 },
    { match: 'Шафа Сіті SeriousM 800', price: 5913 },
];

async function main() {
    const products = await prisma.product.findMany({
        where: { name: { contains: 'Сіті' } },
        select: { id: true, name: true, price: true }
    });

    for (const product of products) {
        let newPrice = null;

        // Check base non-bed items first
        for (const update of priceUpdates) {
            if (product.name.includes(update.match)) {
                newPrice = update.price;
            }
        }

        // Bed logic
        if (product.name.includes('1400')) {
            const base = 5091;
            const lamels = 3584;
            const lift = 1866;
            const board = 2566;
            const dno = 543;

            if (product.name.includes('ламельний каркас') && product.name.includes('підйомний механізм')) {
                newPrice = base + lamels + lift + dno;
            } else if (product.name.includes('ламельною основою') && product.name.includes('підйомним механізмом')) {
                newPrice = base + lamels + lift + dno; // This matches the names in DB
            } else if (product.name.includes('ламельною основою') || product.name.includes('ламельний каркас')) {
                newPrice = base + lamels;
            } else if (product.name.includes('щит ДСП') || product.name.includes('щитом ДСП')) {
                newPrice = base + board;
            } else if (product.name.includes('Сіті 1400 Сонома') || product.name.includes('Ліжко двоспальне SeriousM Сіті 1400')) {
                newPrice = base; // just the frame
            }
        }

        if (product.name.includes('1600')) {
            const base = 5398;
            const lamels = 3716;
            const lift = 1866;
            const board = 2845;
            const dno = 605;

            if (product.name.includes('ламельний каркас') && product.name.includes('підйомний механізм')) {
                newPrice = base + lamels + lift + dno;
            } else if (product.name.includes('ламельною основою') && product.name.includes('підйомним механізмом')) {
                newPrice = base + lamels + lift + dno; // This matches the names in DB
            } else if (product.name.includes('ламельною основою') || product.name.includes('ламельний каркас')) {
                newPrice = base + lamels;
            } else if (product.name.includes('щит ДСП') || product.name.includes('щитом ДСП')) {
                newPrice = base + board;
            } else if (product.name.includes('Сіті 1600 Сонома') || product.name.includes('Ліжко двоспальне SeriousM Сіті 1600')) {
                newPrice = base; // just the frame
            }
        }


        if (newPrice !== null && newPrice !== product.price) {
            console.log(`Updating ${product.name}: ${product.price} -> ${newPrice}`);
            await prisma.product.update({
                where: { id: product.id },
                data: { price: newPrice }
            });
        } else if (newPrice === null) {
            console.log(`!!! No price update found for: ${product.name}`);
        }
    }
}

main().catch(console.error);
