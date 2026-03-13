import 'dotenv/config';
import prisma from '../src/lib/prisma';

const priceUpdates = [
    { match: 'Вішалки настінні SeriousM Нордік 800', price: 639 },
    { match: 'Вішалки настінні SeriousM Нордік 900', price: 1328 },
    { match: 'Дзеркало', price: 1669 },
    { match: 'Комод', price: 5060 },
    { match: 'Полиця', price: 459 },
    { match: 'Тумба Нордік SeriousM 2-х дверна', price: 2111 },
    { match: 'Тумба Нордік SeriousM з чотирма дверцятами', price: 3536 },
    { match: 'Тумба Нордік SeriousM 800', price: 3291 },
    { match: 'Тумба для SeriousM взуття Нордік 800', price: 2865 },
    { match: 'Тумба для SeriousM взуття Нордік 900', price: 1686 },
    { match: 'Приліжкова тумба', price: 1229 },
    { match: 'Тумба ТВ', price: 2816 },
    { match: 'Шафа Нордік SeriousM 1400', price: 9496 },
    { match: 'Шафа Нордік SeriousM 990', price: 6221 },
    { match: 'Пенал закритий', price: 6401 },

    // Beds
    { match: 'Ліжко двоспальне SeriousM Нордік 1400 Дуб', price: 3635 },
    { match: 'Ліжко двоспальне SeriousM Нордік 1400 з ламельною основою', price: 3635 + 3584 },
    { match: 'Ліжко двоспальне SeriousM Нордік 1400 з підйомним', price: 3635 + 3584 + 1866 },
    { match: 'Ліжко двоспальне SeriousM Нордік каркас 1400 щит ДСП', price: 2723 },

    { match: 'Ліжко двоспальне SeriousM Нордік 1600 Дуб', price: 3898 },
    { match: 'Ліжко двоспальне SeriousM Нордік 1600 з ламельною основою', price: 3898 + 3716 },
    { match: 'Ліжко двоспальне SeriousM Нордік 1600 з підйомним', price: 3898 + 3716 + 1866 },
    { match: 'Ліжко двоспальне SeriousM Нордік каркас 1600 щит ДСП', price: 2986 },
];

async function main() {
    const products = await prisma.product.findMany({
        where: { name: { contains: 'Нордік' } },
        select: { id: true, name: true, price: true }
    });

    for (const product of products) {
        let newPrice = null;

        for (const update of priceUpdates) {
            if (product.name.includes(update.match)) {
                newPrice = update.price;
            }
        }

        if (newPrice !== null && newPrice !== product.price) {
            console.log(`Updating ${product.name}: ${product.price} -> ${newPrice}`);
            await prisma.product.update({
                where: { id: product.id },
                data: { price: newPrice }
            });
        } else if (newPrice === null) {
            console.log(`No price update found for: ${product.name}`);
        }
    }
}

main().catch(console.error);
