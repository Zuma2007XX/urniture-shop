import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- FINAL AGGRESSIVE GLOBAL REPLACEMENT (v2) ---');

    // Quoting Order table because it's a reserved keyword in some SQL dialects
    const tables = ['Product', 'Category', 'Collection', 'SiteContent', '"Order"', 'OrderItem'];
    const brandRegex = /EVEREST|Еверест|Эверест/gi;

    for (const table of tables) {
        console.log(`Scanning table: ${table}`);
        const records: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM ${table}`);

        for (const record of records) {
            let recordChanged = false;
            const updateFields: string[] = [];
            const updateValues: any[] = [];

            for (const key in record) {
                const value = record[key];
                if (typeof value === 'string') {
                    // Skip URLs
                    if (value.includes('http') && value.includes('everestmebli.com.ua') && (value.includes('.jpg') || value.includes('.png') || value.includes('.svg'))) {
                        continue;
                    }

                    if (brandRegex.test(value)) {
                        const newValue = value.replace(brandRegex, 'SeriousM');
                        updateFields.push(`${key} = ?`);
                        updateValues.push(newValue);
                        recordChanged = true;
                        console.log(`  [UPDATE ${table} ${record.id}] ${key}: replaced brand`);
                    }
                }
            }

            if (recordChanged) {
                const query = `UPDATE ${table} SET ${updateFields.join(', ')} WHERE id = ?`;
                await prisma.$executeRawUnsafe(query, ...updateValues, record.id);
            }
        }
    }

    console.log('--- GLOBAL REPLACEMENT COMPLETE ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
