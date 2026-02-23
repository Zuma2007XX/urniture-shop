
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const COLLECTION_ID = 'cmlm5rd6w0007horiqiqglwhd'; // Briz Collection ID

async function main() {
    console.log(`Fetching products for collection ${COLLECTION_ID}...`);

    const products = await prisma.product.findMany({
        where: {
            collectionId: COLLECTION_ID
        }
    });

    console.log(`Found ${products.length} products.`);

    let updatedCount = 0;

    for (const product of products) {
        try {
            if (!product.images) continue;

            const images: string[] = JSON.parse(product.images);

            // Deduplicate
            const uniqueImages = Array.from(new Set(images));

            if (uniqueImages.length !== images.length) {
                console.log(`Product ${product.name} (ID: ${product.id}): Found ${images.length} images, cleaning to ${uniqueImages.length}.`);

                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        images: JSON.stringify(uniqueImages)
                    }
                });
                updatedCount++;
            }
        } catch (e) {
            console.error(`Error processing product ${product.id}:`, e);
        }
    }

    console.log(`Finished. Updated ${updatedCount} products.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
