import prisma from '../src/lib/prisma';

async function removeEverest() {
    console.log('Fetching products...');
    const products = await prisma.product.findMany();

    let updatedCount = 0;

    for (const product of products) {
        let newName = product.name;

        // Remove 'Everest' and handle extra spaces it might leave behind.
        // We use a regex to match 'Everest' with optional surrounding spaces, case-insensitive.
        if (/everest/i.test(newName)) {
            newName = newName.replace(/\s*everest\s*/ig, ' ').trim();

            // Just in case it was the only word or it left weird spaces
            newName = newName.replace(/\s{2,}/g, ' ');

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

removeEverest()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
