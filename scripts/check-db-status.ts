import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- DATABASE STATUS CHECK ---');

    try {
        const count: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM Product`);
        console.log('Total products in database (Raw SQL):', count[0].count);

        const cols: any[] = await prisma.$queryRawUnsafe(`PRAGMA table_info(Product)`);
        console.log('Columns in Product table:');
        cols.forEach(c => console.log(` - ${c.name} (${c.type})`));

    } catch (e) {
        console.error('Error checking database:', e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
