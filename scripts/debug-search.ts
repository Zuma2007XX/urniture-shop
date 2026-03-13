
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function testSearch() {
    const search = "стол";
    console.log(`Searching for: ${search}`);

    const searchLower = search.toLowerCase();
    const searchCap = searchLower.charAt(0).toUpperCase() + searchLower.slice(1);
    const searchUpper = search.toUpperCase();

    const results = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: search } },
                { description: { contains: search } },
                { category: { contains: search } },
                { series: { contains: search } },
                // Lowercase
                { name: { contains: searchLower } },
                { description: { contains: searchLower } },
                // Capitalized
                { name: { contains: searchCap } },
                { description: { contains: searchCap } },
                { category: { contains: searchCap } },
                // Uppercase
                { name: { contains: searchUpper } },
            ]
        },
        select: { id: true, name: true }
    });

    console.log(`Found ${results.length} results:`);
    console.log(JSON.stringify(results, null, 2));

    // Test with capitalized explicitly to see if it matches differently
    const termCap = "Шафа";
    console.log(`\nSearching for: ${termCap}`);
    const resultsCap = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: termCap } },
                { description: { contains: termCap } },
                { category: { contains: termCap } }
            ]
        },
        select: { id: true, name: true, images: true }
    });
    console.log(`Found ${resultsCap.length} results:`);
    console.log(JSON.stringify(resultsCap, null, 2));
}

console.log("Script starting...");
testSearch()
    .then(() => console.log("Script finished successfully."))
    .catch(e => {
        console.error("Script failed with error:");
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
