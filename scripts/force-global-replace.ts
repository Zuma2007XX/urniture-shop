import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- GLOBAL BRAND REPLACEMENT (FORCE) ---');

    const tables = ['Product', 'Category', 'Collection'];
    const brandRegex = /EVEREST|Еверест|Эверест/gi;

    for (const table of tables) {
        console.log(`Processing table: ${table}`);
        const records: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM ${table}`);

        for (const record of records) {
            let recordChanged = false;
            const updateData: any = {};

            for (const key in record) {
                const value = record[key];
                if (typeof value === 'string' && brandRegex.test(value)) {
                    const newValue = value.replace(brandRegex, 'SeriousM');
                    updateData[key] = newValue;
                    recordChanged = true;
                    console.log(`  [${table} ${record.id}] Changed ${key}: "${value}" -> "${newValue}"`);
                }
            }

            if (recordChanged) {
                // Construct dynamic update
                const keys = Object.keys(updateData);
                const values = Object.values(updateData);
                let updateQuery = `UPDATE ${table} SET `;
                updateQuery += keys.map((k, i) => `${k} = ?`).join(', ');
                updateQuery += ` WHERE id = ?`;

                await prisma.$executeRawUnsafe(updateQuery, ...values, record.id);
            }
        }
    }

    console.log('--- GLOBAL REPLACEMENT COMPLETE ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
