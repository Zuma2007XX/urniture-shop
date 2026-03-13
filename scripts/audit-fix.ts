import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('Starting intelligent bulk fix of product data (using Raw SQL to avoid schema issues)...');

    const products: any[] = await prisma.$queryRaw`SELECT id, name, sku, description, specifications FROM Product`;

    const isMissingDesc = (p: any) => !p.description || p.description.trim() === '' || p.description.trim() === 'Опис відсутній';
    const hasValidSpecs = (p: any) => {
        if (!p.specifications || p.specifications === '[]' || p.specifications.trim() === '') return false;
        try {
            const s = JSON.parse(p.specifications);
            return !!(s.dimensions?.width || s.materials?.frameMaterial || (s.general && s.general.roomUse));
        } catch { return false; }
    };

    const colorKeywords = [
        'Венге темний', 'Сонома', 'Дуб крафт білий', 'Білий', 'Крафт золотий',
        'Дуб крафт золотий', 'Белый', 'Темний', 'Графіт', 'Трюфель',
        'Кашемір', 'Канелла', 'Німфея', 'Дуб молочний', 'Дуб сонома', 'Венге'
    ];

    const normalizeBaseName = (name: string) => {
        let n = name.replace(/SeriousM/gi, '').trim();
        n = n.replace(/\d+[\s×x\*]+\d+[\s×x\*]+\d+[\s]*мм/i, '');
        colorKeywords.forEach(color => {
            const regex = new RegExp(`\\b${color}\\b`, 'gi');
            n = n.replace(regex, '');
        });
        n = n.replace(/\+\s*/g, '');
        n = n.replace(/\bи\b/gi, '');
        n = n.replace(/\(без матраца\)/gi, '');
        n = n.replace(/\(кутова\)/gi, '');
        n = n.replace(/\bБріз\b/gi, '');
        return n.replace(/\s+/g, ' ').trim();
    };

    const getBestData = (items: any[]) => {
        let bestDesc = null;
        let bestSpecs = null;
        for (const item of items) {
            if (!isMissingDesc(item) && (!bestDesc || item.description.length > bestDesc.length)) {
                bestDesc = item.description;
            }
            if (hasValidSpecs(item) && !bestSpecs) {
                bestSpecs = item.specifications;
            }
        }
        return { bestDesc, bestSpecs };
    };

    const skuMap = new Map();
    const baseNameMap = new Map();

    products.forEach(p => {
        if (p.sku) {
            if (!skuMap.has(p.sku)) skuMap.set(p.sku, []);
            skuMap.get(p.sku).push(p);
        }
        const bn = normalizeBaseName(p.name);
        if (!baseNameMap.has(bn)) baseNameMap.set(bn, []);
        baseNameMap.get(bn).push(p);
    });

    const globalResearched: any = {
        'Асторія-2': {
            desc: "Ліжко 'Асторія-2' від меблевої фабрики 'Еверест' — надійне та стильне рішення. Виготовлене з якісного ЛДСП 16 мм Kronospan.",
            specs: {
                materials: { frameMaterial: 'ЛДСП 16мм', facadeMaterial: 'ЛДСП 16мм' },
                dimensions: { width: 850, depth: 1930, height: 740 },
                warranty: { period: '12 місяців', production: 'Україна' },
                general: { location: 'Напольна' }
            }
        },
        'Соната 400': {
            desc: "Пенал Соната 400 — це закритий шкаф з 5 полицями, що входить до модульної системи 'Соната'.",
            specs: {
                materials: { frameMaterial: 'ЛДСП 16мм', facadeMaterial: 'ЛДСП 16мм' },
                dimensions: { width: 400, depth: 380, height: 2050 },
                warranty: { period: '12 місяців', production: 'Україна' },
                frame: { shelfCount: '5' }
            }
        },
        'Сіті 1600': {
            desc: "Ліжко Сіті 1600 — сучасна та практична модель для просторої спальні. Корпус виготовлений з якісної ЛДСП Kronospan.",
            specs: {
                materials: { frameMaterial: 'ЛДСП 16мм', facadeMaterial: 'ЛДСП 16мм' },
                dimensions: { width: 1688, depth: 2030, height: 839 },
                warranty: { period: '12 місяців', production: 'Україна' }
            }
        }
    };

    let updateCount = 0;

    for (const p of products) {
        let changed = false;
        let newName = p.name;
        let newDesc = p.description;
        let newSpecs = p.specifications;

        // 1. Clean Name
        const cleanName = p.name.replace(/SeriousM\s*/gi, '').trim();
        if (cleanName !== p.name) {
            newName = cleanName;
            changed = true;
        }

        const needsDesc = isMissingDesc(p);
        const needsSpecs = !hasValidSpecs(p);

        if (needsDesc || needsSpecs) {
            const skuSiblings = skuMap.get(p.sku) || [];
            const skuBest = getBestData(skuSiblings);

            const bn = normalizeBaseName(p.name);
            const bnSiblings = baseNameMap.get(bn) || [];
            const bnBest = getBestData(bnSiblings);

            const resKey = Object.keys(globalResearched).find(k => p.name.includes(k));
            const res = resKey ? globalResearched[resKey] : null;

            if (needsDesc) {
                const descToApply = skuBest.bestDesc || bnBest.bestDesc || res?.desc;
                if (descToApply) {
                    newDesc = descToApply;
                    changed = true;
                }
            }

            if (needsSpecs) {
                const specsToApply = skuBest.bestSpecs || bnBest.bestSpecs || (res?.specs ? JSON.stringify(res.specs) : null);
                if (specsToApply) {
                    newSpecs = specsToApply;
                    changed = true;
                }
            }
        }

        if (changed) {
            await prisma.$executeRaw`
                UPDATE Product 
                SET name = ${newName}, 
                    description = ${newDesc}, 
                    specifications = ${newSpecs} 
                WHERE id = ${p.id}
            `;
            updateCount++;
        }
    }

    console.log(`Successfully updated ${updateCount} products using Raw SQL.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
