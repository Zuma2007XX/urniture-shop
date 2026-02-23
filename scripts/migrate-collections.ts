import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function transliterate(text: string): string {
    const map: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
        'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya',
        'ы': 'y', 'э': 'e', 'ё': 'yo'
    };

    return text.toLowerCase().split('').map(char => map[char] || char).join('');
}

async function main() {
    console.log('Starting migration of collections...');

    // Cleanup bad slugs first
    await prisma.collection.deleteMany({
        where: { slug: { in: ['', '-'] } }
    });

    const sections = ['collection_1', 'collection_2', 'collection_3'];

    for (const section of sections) {
        const content = await prisma.siteContent.findUnique({
            where: { section }
        });

        if (!content || !content.title) {
            console.log(`Skipping ${section}: no content or title found`);
            continue;
        }

        console.log(`Migrating ${content.title}...`);

        let slug = transliterate(content.title)
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        if (!slug) slug = `collection-${section.split('_')[1]}`;

        // Check if slug exists
        const existing = await prisma.collection.findUnique({ where: { slug } });
        if (existing) {
            console.log(`Collection ${slug} already exists, updating content if needed...`);
            // Optional: update content
            await prisma.collection.update({
                where: { slug },
                data: {
                    title: content.title,
                    description: content.body || '',
                    image: content.image || '',
                }
            });
            continue;
        }

        try {
            await prisma.collection.create({
                data: {
                    title: content.title,
                    slug: slug,
                    description: content.body || '',
                    image: content.image || '',
                }
            });
            console.log(`Created collection: ${content.title} (${slug})`);
        } catch (error) {
            console.error(`Failed to create ${slug}:`, error);
        }
    }

    console.log('Migration complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
