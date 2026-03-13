import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- FIXING PRODUCTION SCHEMA (V2) ---');

    // Quoting "Order" table name
    const fixes = [
        { table: '"Order"', column: 'read', type: 'BOOLEAN', defaultValue: '0' },
        { table: '"Order"', column: 'orderNumber', type: 'TEXT', defaultValue: 'NULL' }
    ];

    for (const fix of fixes) {
        try {
            console.log(`Checking ${fix.table}.${fix.column}...`);
            await prisma.$executeRawUnsafe(`ALTER TABLE ${fix.table} ADD COLUMN ${fix.column} ${fix.type} ${fix.defaultValue !== 'NULL' ? 'DEFAULT ' + fix.defaultValue : ''}`);
            console.log(`Successfully added ${fix.table}.${fix.column}`);
        } catch (e: any) {
            console.log(`Skipping ${fix.table}.${fix.column}: ${e.message}`);
        }
    }

    console.log('--- SCHEMA SYNC COMPLETE ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
