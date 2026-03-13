import 'dotenv/config';
import prisma from '../src/lib/prisma';

// Vocabulary for generation
const adjectives = ['Стильний', 'Сучасний', 'Елегантний', 'Практичний', 'Надійний', 'Ергономічний', 'Вишуканий', 'Універсальний', 'Функціональний', 'Преміальний'];
const benefits = [
    'який стане справжньою окрасою вашого інтер\'єру',
    'що ідеально доповнить сучасний дизайн кімнати',
    'створений для вашого максимального комфорту',
    'який підкреслить ваш витончений смак',
    'що забезпечить раціональне використання простору'
];

const isEmptyDesc = (desc: string | null) => {
    if (!desc) return true;
    const trimmed = desc.trim().toLowerCase();
    return trimmed.includes('опис відсутній') || trimmed.length < 20;
};

const generateDescription = (product: any, lang: 'uk' | 'ru') => {
    const isUk = lang === 'uk';

    // Extract metadata
    const category = product.category.toLowerCase();
    const isBed = category.includes('ліжк') || category.includes('кроват');
    const isCabinet = category.includes('шаф') || category.includes('шкаф') || category.includes('пенал');
    const isCommode = category.includes('комод');
    const isTable = category.includes('стіл') || category.includes('стол');

    let specs: any = {};
    if (product.specifications) {
        try { specs = JSON.parse(product.specifications); } catch (e) { }
    }

    const dims = specs.dimensions || {};
    const materials = specs.materials || {};
    const general = specs.general || {};

    let name = (isUk ? product.name : (product.nameRu || product.name)).replace(/&nbsp;/g, ' ').replace(/-/g, ' ');

    // 1. Hook
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const benefit = benefits[Math.floor(Math.random() * benefits.length)];
    let intro = isUk ? `${adj} виріб — ${name}, ${benefit}.` : `Этот товар — ${name}, который станет отличным дополнением вашего интерьера.`;

    if (isBed) {
        intro = isUk ? `Подаруйте собі здоровий сон та естетичну насолоду з ${name}. Ця модель розроблена з урахуванням найновіших стандартів ергономіки.` : `Подарите себе здоровый сон и эстетическое удовольствие с ${name}. Модель разработана с учетом новейших стандартов эргономики.`;
    } else if (isCabinet || isCommode) {
        intro = isUk ? `Організуйте свій простір ідеально! ${name} — це місткість, надійність та бездоганний стиль у кожній деталі.` : `Организуйте свое пространство идеально! ${name} — это вместительность, надежность и безупречный стиль в каждой детали.`;
    }

    // 2. Features
    let featuresHtml = isUk ? `\n\n✨ **Чому варто обрати саме цю модель?**\n` : `\n\n✨ **Почему стоит выбрать именно эту модель?**\n`;

    if (product.series || product.collectionId) {
        featuresHtml += isUk ? `• **Дизайн:** Належить до ексклюзивної серії ${product.series || 'меблів'}, що дозволяє легко комбінувати її з іншими елементами.\n` : `• **Дизайн:** Принадлежит к эксклюзивной серии ${product.series || 'мебели'}, что позволяет легко комбинировать ее с другими элементами.\n`;
    }

    if (materials.frameMaterial || materials.facadeMaterial) {
        const mat = materials.facadeMaterial || materials.frameMaterial;
        featuresHtml += isUk ? `• **Матеріали:** Виготовлено з високоякісного матеріалу (${mat}), що гарантує довговічність та стійкість до зношення.\n` : `• **Материалы:** Изготовлено из высококачественного материала (${mat}), что гарантирует долговечность и стойкость к износу.\n`;
    } else if (product.material) {
        featuresHtml += isUk ? `• **Матеріали:** Надійний корпус (${product.material}) забезпечує стабільність конструкції.\n` : `• **Материалы:** Надежный корпус (${product.material}) обеспечивает стабильность конструкции.\n`;
    }

    if (dims.width && dims.height) {
        featuresHtml += isUk ? `• **Габарити:** Оптимальні розміри (${dims.width}x${dims.height} мм) дозволяють зберегти корисну площу кімнати.\n` : `• **Габариты:** Оптимальные размеры (${dims.width}x${dims.height} мм) позволяют сохранить полезную площадь комнаты.\n`;
    }

    if (general.drawerGuides) {
        featuresHtml += isUk ? `• **Фурнітура:** Використовуються надійні направляючі (${general.drawerGuides}) для тихого та плавного відкривання.\n` : `• **Фурнитура:** Используются надежные направляющие (${general.drawerGuides}) для тихого и плавного открывания.\n`;
    }

    // 3. Conclusion
    const outro = isUk
        ? `\n🌟 *Зробіть свій дім ще затишнішим! Замовляйте зараз та насолоджуйтесь справжньою якістю від вітчизняного виробника.*`
        : `\n🌟 *Сделайте свой дом еще уютнее! Заказывайте сейчас и наслаждайтесь настоящим качеством от отечественного производителя.*`;

    const existingDesc = isUk ? product.description : (product.descriptionRu || product.description);

    if (!isEmptyDesc(existingDesc)) {
        // If it looks like we ALREADY generated rich description during the first pass (has "✨"), skip to avoid duplicating
        if (existingDesc.includes('✨')) {
            return existingDesc;
        }
        return existingDesc + '\n' + featuresHtml + outro;
    }

    return intro + featuresHtml + outro;
};

async function main() {
    console.log('Fetching products...');
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products. Starting generation...`);

    let updatedCount = 0;

    for (const product of products) {
        const descUk = generateDescription(product, 'uk');
        const descRu = generateDescription(product, 'ru');

        // Only update if changed
        if (descUk !== product.description || descRu !== product.descriptionRu) {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    description: descUk,
                    descriptionRu: descRu,
                }
            });
            updatedCount++;

            if (updatedCount % 50 === 0) {
                console.log(`Updated ${updatedCount} products...`);
            }
        }
    }

    console.log(`\n✅ Successfully generated rich descriptions for ${updatedCount} products!`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
