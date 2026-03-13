import 'dotenv/config';
import prisma from '../src/lib/prisma';

const priceUpdates = [
    { match: 'Комод Лайт SeriousM КЛ-3', price: 4294 },
    { match: 'Комод ЕVEREST SeriousM Лайт КЛ-4', price: 5058 },
    { match: 'Пенал Лайт SeriousM ПЛ-1', price: 3640 },
    { match: 'Настінна полиця SeriousM Лайт ПЛН-1', price: 530 },
    { match: 'Полиця Лайт SeriousM ПЛН-2', price: 763 },
    { match: 'Стіл Лайт SeriousM СЛ-1', price: 2706 },
    { match: 'Тумба під SeriousM телевізор Лайт ЛТВ-1400', price: 3688 },
    { match: 'Тумба приліжкова SeriousM Лайт ТЛ-1', price: 1525 },
    { match: 'Шафа двостулкова SeriousM Лайт ШЛ-2', price: 6378 },
    { match: 'Шафа Лайт SeriousM ШЛ-3', price: 9256 },
];

async function main() {
    const products = await prisma.product.findMany({
        where: { name: { contains: 'Лайт' } },
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
        if (product.name.includes('КЛ-1400')) {
            const base = 5120;
            const lamels = 3584;
            const lift = 1866;
            const board = 2723;
            const dno = 779;

            if (product.name.includes('ламельний каркас') && product.name.includes('підйомний механізм')) {
                // "Ліжко двоспальне SeriousM каркас, ламельний каркас, підйомний механізм, дно Лайт КЛ-1400"
                newPrice = base + lamels + lift + dno;
            } else if (product.name.includes('ламельний каркас') || product.name.includes('ламельною основою')) {
                newPrice = base + lamels;
            } else if (product.name.includes('щит ДСП')) {
                newPrice = base + board;
            } else if (product.name.includes('каркас Лайт КЛ-1400') || product.name.includes('каркас КЛ-1400') || product.name.includes('Ліжко двуспальне SeriousM каркас Лайт КЛ-1400')) {
                newPrice = base; // just the frame
            }
        }

        if (product.name.includes('КЛ-1600')) {
            const base = 5429;
            const lamels = 3716;
            const lift = 1866;
            const board = 2986;
            const dno = 890;

            if (product.name.includes('ламельний каркас') && product.name.includes('підйомний механізм')) {
                newPrice = base + lamels + lift + dno;
            } else if (product.name.includes('ламельний каркас') || product.name.includes('ламельною основою')) {
                // "Ліжко двоспальне SeriousM каркас + ламельний каркас Лайт КЛ-1600"
                newPrice = base + lamels;
            } else if (product.name.includes('щит ДСП')) {
                newPrice = base + board;
            } else if (product.name.includes('каркас Лайт КЛ-1600') || product.name.includes('Ліжко двуспальне SeriousM каркас Лайт КЛ-1600') || product.name.includes('Ліжко КЛ-1600 NEW')) {
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
