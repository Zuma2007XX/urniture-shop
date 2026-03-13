import 'dotenv/config';
import prisma from '../src/lib/prisma';

const priceUpdates = [
    { match: 'Дзеркало', exclude: 'до шафи', price: 1304 },
    { match: 'Комод Соната SeriousM 1 ', price: 2815 },
    { match: 'Комод Соната SeriousM 2 ', price: 3455 },
    { match: 'Комод Соната SeriousM 3 ', price: 3739 },
    { match: 'Комод Соната SeriousM 4 ', price: 2638 },
    { match: 'Комод Соната SeriousM 5 ', price: 4015 },
    { match: 'Комод Соната SeriousM 7 ', price: 4115 },
    { match: 'Комод Соната SeriousM 8 ', price: 4801 },
    { match: 'Ліжко Соната SeriousM 1400', price: 5243 },
    { match: 'Ліжко Соната SeriousM 1600', price: 5524 },
    { match: 'Односпальне ліжко SeriousM Соната 900', price: 3600 },
    { match: 'Надставка для', price: 1960 },
    { match: 'Закритий пенал SeriousM Соната', price: 2651 },
    { match: 'Відкритий пенал SeriousM Соната', price: 2570 },
    { match: 'Пуф', price: 655 },
    { match: 'Стінка Соната', price: 6519 },
    { match: 'Журнальний стіл SeriousM Соната 910', price: 1278 },
    { match: 'Стіл письмовий SeriousM Соната', price: 3361 },
    { match: 'Тумба під SeriousM ТВ', price: 3089 },
    { match: 'Тумба для SeriousM взуття Соната 600', price: 1646 },
    { match: 'Тумба для SeriousM взуття Соната 800', price: 3260 },
    { match: 'Тумба приліжкова SeriousM Соната', price: 1510 },
    { match: 'Шафа Соната SeriousM 1200', price: 7029 },
    { match: 'Шафа Соната SeriousM 600', price: 3945 },
    { match: 'Шафа Соната SeriousM 800', price: 6169 },
    { match: 'Кутова шафа SeriousM Соната', price: 4973 },
    { match: 'Вішалка настінна SeriousM Соната 600', price: 1199 },
    { match: 'Щит вішалка SeriousM Соната 800', price: 713 },
    { match: 'Дзеркало до шафи', price: 1245 },
];

async function main() {
    const products = await prisma.product.findMany({
        where: { name: { contains: 'Соната' } },
        select: { id: true, name: true, price: true }
    });

    for (const product of products) {
        let newPrice = null;

        for (const update of priceUpdates) {
            if (product.name.includes(update.match)) {
                if (update.exclude && product.name.includes(update.exclude)) {
                    continue;
                }
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
            console.log(`!!! No price update found for: ${product.name}`);
        }
    }
}

main().catch(console.error);
