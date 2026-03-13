import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    const p: any[] = await prisma.$queryRaw`SELECT id, name, description FROM Product WHERE name LIKE '%Асторія-2%'`;
    console.log(JSON.stringify(p, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
