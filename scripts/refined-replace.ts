import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- TARGETED BRAND REPLACEMENT (TEXT ONLY) ---');

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
                if (typeof value === 'string') {
                    // Check if it's a URL or contains URLs (very basic check)
                    if (value.includes('http://') || value.includes('https://') || value.includes('.jpg') || value.includes('.png')) {
                        // If it's a URL, we only want to fix it if it's NOT in the domain part
                        // But to be safe, let's just NOT touch URLs for now if they broken.
                        // Wait, if I already broke them, I MUST fix them back.
                        if (value.includes('SeriousMmebli')) {
                            const fixedValue = value.replace(/SeriousMmebli/g, 'everestmebli');
                            updateData[key] = fixedValue;
                            recordChanged = true;
                            console.log(`  [REVERT URL ${table} ${record.id}] ${key}: restored everestmebli`);
                        }
                        continue;
                    }

                    if (brandRegex.test(value)) {
                        const newValue = value.replace(brandRegex, 'SeriousM');
                        updateData[key] = newValue;
                        recordChanged = true;
                        console.log(`  [UPDATE ${table} ${record.id}] ${key}: "${value}" -> "${newValue}"`);
                    }
                }
            }

            if (recordChanged) {
                const keys = Object.keys(updateData);
                const values = Object.values(updateData);
                let updateQuery = `UPDATE ${table} SET `;
                updateQuery += keys.map((k, i) => `${k} = ?`).join(', ');
                updateQuery += ` WHERE id = ?`;

                await prisma.$executeRawUnsafe(updateQuery, ...values, record.id);
            }
        }
    }

    console.log('--- TARGETED REPLACEMENT COMPLETE ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
