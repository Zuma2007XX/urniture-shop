import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- CLEANING UP TEST LABELS EVERYWHERE ---');

    const testPrefix = 'ВЕРСІЯ SeriousM: ';
    const testSuffix = '. ВСЕ "EVEREST" ВИДАЛЕНО.';

    const tables = ['Product', 'Category', 'Collection', 'SiteContent'];

    for (const table of tables) {
        const records: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM ${table}`);

        for (const record of records) {
            let recordChanged = false;
            const updateFields: string[] = [];
            const updateValues: any[] = [];

            for (const key in record) {
                const value = record[key];
                if (typeof value === 'string') {
                    if (value.includes(testPrefix) || value.includes(testSuffix)) {
                        let newValue = value.replace(testPrefix, '').replace(testSuffix, '');
                        updateFields.push(`${key} = ?`);
                        updateValues.push(newValue);
                        recordChanged = true;
                        console.log(`  [CLEAN ${table} ${record.id}] Removed test text from ${key}`);
                    }
                }
            }

            if (recordChanged) {
                const query = `UPDATE ${table} SET ${updateFields.join(', ')} WHERE id = ?`;
                await prisma.$executeRawUnsafe(query, ...updateValues, record.id);
            }
        }
    }

    console.log('--- CLEANUP COMPLETE ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
