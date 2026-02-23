import prisma from '../src/lib/prisma';

async function renameToSeriousM() {
    console.log('Fetching products to add "SeriousM"...');
    const products = await prisma.product.findMany();

    let updatedCount = 0;

    for (const product of products) {
        let newName = product.name;

        // Check if SeriousM is already in the name to avoid duplicates
        if (!/SeriousM/i.test(newName)) {

            // "Everest" was originally near the beginning, usually after the generic word like "Шафа", "Ліжко", etc.
            // Example: "Ліжко двоспальне каркас Лайт" -> "Ліжко двоспальне каркас SeriousM Лайт"

            // To make it look natural, we will try to place it before specific collection words like "Лайт", "Соната", "Бриз", "Атлант"
            // If we can't find a collection word, we just prefix it.

            const collections = ['Лайт', 'Соната', 'Бриз', 'Атлант', 'Асті', 'Оптіма', 'Нордік', 'Твікс', 'Рондо', 'Квадро', 'Гамма', 'Еко', 'Симфонія', 'Прованс'];
            let inserted = false;

            for (const col of collections) {
                const regex = new RegExp(`\\b${col}\\b`);
                if (regex.test(newName)) {
                    newName = newName.replace(regex, `SeriousM ${col}`);
                    inserted = true;
                    break;
                }
            }

            if (!inserted) {
                // If no known collection word, add it after the first 2 words (usually "Ліжко двоспальне", "Тумба приліжкова", etc), or just at the start
                const words = newName.split(' ');
                if (words.length > 2) {
                    words.splice(2, 0, 'SeriousM');
                    newName = words.join(' ');
                } else {
                    newName = `SeriousM ${newName}`;
                }
            }


            console.log(`Updating: "${product.name}" -> "${newName}"`);

            await prisma.product.update({
                where: { id: product.id },
                data: { name: newName }
            });
            updatedCount++;
        }
    }

    console.log(`\nSuccessfully updated ${updatedCount} products.`);
}

renameToSeriousM()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
