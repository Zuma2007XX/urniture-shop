import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- TEST OVERWRITE FOR ASTORIA-2 ---');
    const id = 'cmlmw8ahu000gfqritoankkqx';
    const newDesc = 'ВЕРСІЯ SeriousM: Меблі з колекції Бріз. Ліжко SeriousM Бріз Асторія-2 853×1932×740 мм Сонома + Білий (без матраца). ВСЕ "EVEREST" ВИДАЛЕНО.';

    await prisma.$executeRaw`UPDATE Product SET description = ${newDesc} WHERE id = ${id}`;

    const p: any[] = await prisma.$queryRaw`SELECT id, name, description FROM Product WHERE id = ${id}`;
    console.log('Updated Record:', JSON.stringify(p, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
