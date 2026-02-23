import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    const sections = [
        {
            section: 'hero',
            title: 'СТВОРЮЄМО\nКОМФОРТ',
            linkText: 'Дивитись все',
            linkUrl: '/catalog'
        },
        {
            section: 'featured_title',
            title: 'Хіти продажу',
            subtitle: 'Найбільш затребувані моделі сезону'
        },
        {
            section: 'collections_title',
            title: 'Колекції'
        }
    ];

    for (const item of sections) {
        const existing = await prisma.siteContent.findUnique({
            where: { section: item.section }
        });

        if (!existing) {
            await prisma.siteContent.create({
                data: item
            });
            console.log(`Created default content for ${item.section}`);
        } else {
            console.log(`Content for ${item.section} already exists.`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
