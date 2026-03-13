import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- ADDING MISSING COLUMNS ---');

    try {
        console.log('Adding isActive to Product...');
        await prisma.$executeRawUnsafe(`ALTER TABLE Product ADD COLUMN isActive BOOLEAN DEFAULT 1`);
        console.log('Success.');
    } catch (e: any) {
        console.log('Product.isActive might already exist or error:', e.message);
    }

    try {
        console.log('Adding isActive to Collection...');
        await prisma.$executeRawUnsafe(`ALTER TABLE Collection ADD COLUMN isActive BOOLEAN DEFAULT 1`);
        console.log('Success.');
    } catch (e: any) {
        console.log('Collection.isActive might already exist or error:', e.message);
    }

    // Also check OrderItem just in case
    try {
        const cols: any[] = await prisma.$queryRawUnsafe(`PRAGMA table_info(OrderItem)`);
        console.log('OrderItem columns checked.');
    } catch (e) { }

    console.log('--- DONE ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
