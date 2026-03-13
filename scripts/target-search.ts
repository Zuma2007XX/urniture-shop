import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    const text = 'Меблі з колекції Бріз';
    const results: any[] = await prisma.$queryRawUnsafe(`SELECT id, name, description FROM Product WHERE description LIKE ?`, `%${text}%`);

    console.log(`Found ${results.length} products with that text.`);
    results.forEach(r => {
        console.log(`ID: ${r.id}`);
        console.log(`Name: ${r.name}`);
        console.log(`Desc: ${r.description}`);
        console.log('---');
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
