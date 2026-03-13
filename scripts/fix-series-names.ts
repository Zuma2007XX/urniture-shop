import 'dotenv/config';
import prisma from '../src/lib/prisma';

const seriesMap: Record<string, { uk: string, ru: string }> = {
    'sonata': { uk: 'Соната', ru: 'Соната' },
    'layt': { uk: 'Лайт', ru: 'Лайт' },
    'nordik': { uk: 'Нордік', ru: 'Нордик' },
    'siti': { uk: 'Сіті', ru: 'Сити' },
    'briz': { uk: 'Бріз', ru: 'Бриз' },
    'stajl': { uk: 'Стайл', ru: 'Стайл' },
    'lincoln': { uk: 'Лінкольн', ru: 'Линкольн' },
    'tokio': { uk: 'Токіо', ru: 'Токио' },
    'gloriya': { uk: 'Глорія', ru: 'Глория' },
    'astoria': { uk: 'Асторія', ru: 'Астория' },
};

function getCleanSeries(slug: string | null, name: string, lang: 'uk' | 'ru'): string {
    if (!slug) return lang === 'uk' ? 'меблів' : 'мебели';

    // Check if it matches a known prefix
    for (const [key, val] of Object.entries(seriesMap)) {
        if (slug.toLowerCase().startsWith(key)) {
            return val[lang];
        }
    }

    // Fallback: try to extract from name
    for (const [key, val] of Object.entries(seriesMap)) {
        if (name.toLowerCase().includes(val[lang].toLowerCase())) {
            return val[lang];
        }
    }

    return lang === 'uk' ? 'меблів' : 'мебели';
}

async function main() {
    const products = await prisma.product.findMany();
    let updated = 0;

    for (const p of products) {
        let saveNeeded = false;
        let descUk = p.description;
        let descRu = p.descriptionRu;

        const cleanUk = getCleanSeries(p.series, p.name, 'uk');
        const cleanRu = getCleanSeries(p.series, p.name, 'ru');

        // Regex to replace "серії <SLUG>,"
        if (descUk && p.series && descUk.includes(p.series)) {
            descUk = descUk.replace(`серії ${p.series}`, `серії ${cleanUk}`);
            saveNeeded = true;
        }

        if (descRu && p.series && descRu.includes(p.series)) {
            descRu = descRu.replace(`серии ${p.series}`, `серии ${cleanRu}`);
            saveNeeded = true;
        }

        if (saveNeeded) {
            await prisma.product.update({
                where: { id: p.id },
                data: {
                    description: descUk,
                    descriptionRu: descRu
                }
            });
            updated++;
        }
    }
    console.log(`Updated ${updated} descriptions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
