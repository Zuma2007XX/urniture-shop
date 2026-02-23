import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

console.log('Seeding database...');
// Use standard PrismaClient without adapter for seeding to avoid environment issues
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Create admin user
    const adminPassword = await hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@unik.com' },
        update: {},
        create: {
            email: 'admin@unik.com',
            password: adminPassword,
            name: 'Адміністратор',
            role: 'admin',
        },
    });
    console.log('Admin user created:', admin.email);

    // Seed products
    const products = [
        {
            name: 'Крісло Lounge',
            description: 'Шедевр технічного мінімалізму. Buddy Lounge Seating поєднує структурну точність з неперевершеним комфортом.',
            price: 45000,
            images: JSON.stringify(['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=2787&auto=format&fit=crop']),
            category: 'chairs',
            stock: 10,
            series: 'Серія 01',
            badge: 'NEW',
            material: 'Шкіра та горіх',
            frame: 'Натуральний дуб',
            upholstery: 'Вовна Virgin',
            loadLimit: '180 кг',
            assembly: 'Повна збірка',
            recyclability: '94.2%',
            warranty: '10 років',
            concept: 'Шедевр технічного мінімалізму. Buddy Lounge Seating поєднує структурну точність з неперевершеним комфортом. Кожен кут розрахований для ергономічної підтримки, загорнутий у стійку розкіш.',
        },
        {
            name: 'Стіл Nordic',
            description: 'Елегантний стіл у скандинавському стилі з натурального дуба.',
            price: 28000,
            images: JSON.stringify(['https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?q=80&w=2942&auto=format&fit=crop']),
            category: 'tables',
            stock: 8,
            series: 'Серія 01',
            badge: null,
            material: 'Натуральний дуб',
            frame: 'Натуральний дуб',
            upholstery: null,
            loadLimit: '120 кг',
            assembly: 'Повна збірка',
            recyclability: '89%',
            warranty: '8 років',
            concept: 'Стіл Nordic — це втілення скандинавського мінімалізму. Чисті лінії та якісне дерево створюють предмет, який стане центром вашого інтер\'єру.',
        },
        {
            name: 'Лампа Aura',
            description: 'Мінімалістичний світильник з матової чорної сталі.',
            price: 12500,
            images: JSON.stringify(['https://images.unsplash.com/photo-1507473888900-52a1b2d8f9d7?q=80&w=2680&auto=format&fit=crop']),
            category: 'lamps',
            stock: 15,
            series: 'Серія 02',
            badge: null,
            material: 'Матова чорна сталь',
            frame: null,
            upholstery: null,
            loadLimit: null,
            assembly: 'Готова до використання',
            recyclability: '78%',
            warranty: '5 років',
            concept: 'Лампа Aura створює м\'яке розсіяне світло, що перетворює будь-який простір на затишний куточок.',
        },
        {
            name: 'Диван Soft',
            description: 'Просторий диван з оксамитовою оббивкою для максимального комфорту.',
            price: 120000,
            images: JSON.stringify(['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2940&auto=format&fit=crop']),
            category: 'sofas',
            stock: 5,
            series: 'Серія 01',
            badge: 'SALE',
            material: 'Оксамит сірий',
            frame: 'Натуральний бук',
            upholstery: 'Оксамит преміум',
            loadLimit: '250 кг',
            assembly: 'Повна збірка',
            recyclability: '91%',
            warranty: '12 років',
            concept: 'Диван Soft — це символ розкоші та комфорту. Глибока посадка та м\'яка оббивка створюють ідеальне місце для відпочинку.',
        },
        {
            name: 'Стілець Archi',
            description: 'Легкий та елегантний стілець з натурального ясена.',
            price: 8500,
            images: JSON.stringify(['https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=2564&auto=format&fit=crop']),
            category: 'chairs',
            stock: 20,
            series: 'Серія 02',
            badge: null,
            material: 'Ясен натуральний',
            frame: 'Ясен',
            upholstery: null,
            loadLimit: '130 кг',
            assembly: 'Потребує збірки',
            recyclability: '96%',
            warranty: '7 років',
            concept: 'Стілець Archi поєднує функціональність та естетику. Його легка конструкція робить його ідеальним для сучасного інтер\'єру.',
        },
        {
            name: 'Торшер Studio',
            description: 'Торшер з матовою латунною поверхнею для стильного освітлення.',
            price: 18000,
            images: JSON.stringify(['https://images.unsplash.com/photo-1513506003011-3b03124ae7a9?q=80&w=2566&auto=format&fit=crop']),
            category: 'lamps',
            stock: 12,
            series: 'Серія 02',
            badge: null,
            material: 'Латунь матова',
            frame: null,
            upholstery: null,
            loadLimit: null,
            assembly: 'Готова до використання',
            recyclability: '82%',
            warranty: '5 років',
            concept: 'Торшер Studio — це архітектурний акцент, що поєднує форму та функцію.',
        },
        {
            name: 'Столик Tono',
            description: 'Декоративний столик з керамічною поверхнею пісочного відтінку.',
            price: 15000,
            images: JSON.stringify(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2670&auto=format&fit=crop']),
            category: 'decor',
            stock: 7,
            series: 'Серія 03',
            badge: null,
            material: 'Кераміка пісочна',
            frame: null,
            upholstery: null,
            loadLimit: '30 кг',
            assembly: 'Готова до використання',
            recyclability: '70%',
            warranty: '3 роки',
            concept: 'Столик Tono — це мінімалістичний декоративний елемент, що додає тепла і текстури.',
        },
        {
            name: 'Крісло Nora',
            description: 'Затишне крісло з оббивкою з тканини букле.',
            price: 38000,
            images: JSON.stringify(['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=2565&auto=format&fit=crop']),
            category: 'chairs',
            stock: 6,
            series: 'Серія 01',
            badge: null,
            material: 'Букле тканина',
            frame: 'Натуральний дуб',
            upholstery: 'Букле преміум',
            loadLimit: '150 кг',
            assembly: 'Повна збірка',
            recyclability: '88%',
            warranty: '10 років',
            concept: 'Крісло Nora — це поєднання класичної елегантності та сучасного комфорту. Тканина букле надає затишності.',
        },
    ];

    for (const product of products) {
        await prisma.product.create({ data: product });
    }
    console.log(`Seeded ${products.length} products`);

    // Seed site content
    const contents = [
        {
            section: 'hero',
            title: 'СТВОРЮЄМО\nКОМФОРТ',
            subtitle: 'Меблі, що визначають ваш простір.\nЕстетика мінімалізму в кожній деталі.',
            image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2700&auto=format&fit=crop',
            linkText: 'Дивитись все',
            linkUrl: '/catalog',
        },
        {
            section: 'featured_title',
            title: 'Хіти продажу',
            subtitle: 'Найбільш затребувані моделі сезону',
            linkText: 'Дивитись всі хіти',
            linkUrl: '/catalog',
        },
        {
            section: 'collections_title',
            title: 'Колекції',
        },
        {
            section: 'collection_1',
            title: 'Скандинавський мінімалізм',
            image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=2565&auto=format&fit=crop',
            linkUrl: '/catalog',
        },
        {
            section: 'collection_2',
            title: 'Сучасна класика',
            image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2670&auto=format&fit=crop',
            linkUrl: '/catalog',
        },
        {
            section: 'collection_3',
            title: 'Індустріальний лофт',
            image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2670&auto=format&fit=crop',
            linkUrl: '/catalog',
        },
    ];

    for (const content of contents) {
        await prisma.siteContent.create({ data: content });
    }
    console.log(`Seeded ${contents.length} site content sections`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
