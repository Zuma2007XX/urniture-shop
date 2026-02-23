'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
    question: string;
    answer: string;
}

const faqCategories: { title: string; items: FAQItem[] }[] = [
    {
        title: 'Замовлення',
        items: [
            {
                question: 'Як оформити замовлення?',
                answer: 'Ви можете оформити замовлення через наш сайт, додавши товари до кошика та заповнивши форму оформлення. Також можна зробити замовлення за телефоном або написати нам у Telegram.',
            },
            {
                question: 'Чи можна змінити або скасувати замовлення?',
                answer: 'Так, ви можете змінити або скасувати замовлення до моменту його відправки. Для цього зв\'яжіться з нашим менеджером за телефоном або у Telegram.',
            },
            {
                question: 'Як дізнатися статус замовлення?',
                answer: 'Після відправки замовлення ви отримаєте номер ТТН для відстеження. Також ви можете дізнатися статус замовлення у нашого менеджера або у вашому особистому кабінеті на сайті.',
            },
            {
                question: 'Чи можна замовити меблі за індивідуальними розмірами?',
                answer: 'Наші меблі виготовляються у стандартних розмірах. Якщо вам потрібен нестандартний розмір — зв\'яжіться з нами для уточнення можливостей.',
            },
        ],
    },
    {
        title: 'Доставка',
        items: [
            {
                question: 'Скільки коштує доставка?',
                answer: 'Вартість доставки розраховується за тарифами транспортної компанії та залежить від ваги, габаритів замовлення та міста доставки. Самовивіз зі складу у м. Запоріжжя — безкоштовно.',
            },
            {
                question: 'Як довго чекати на доставку?',
                answer: 'Якщо товар є на складі — відправка протягом 1-2 робочих днів. Доставка Новою Поштою зазвичай займає 1-3 дні. Для великогабаритних меблів через Delivery — 2-5 днів.',
            },
            {
                question: 'Чи доставляєте ви за кордон?',
                answer: 'На даний момент ми здійснюємо доставку тільки по території України. Для міжнародних замовлень зв\'яжіться з нами для індивідуального розрахунку.',
            },
            {
                question: 'Чи є доставка до дверей?',
                answer: 'Так, Нова Пошта пропонує адресну доставку до дверей. Також для великогабаритних меблів доступна доставка з підйомом на поверх за додаткову плату.',
            },
        ],
    },
    {
        title: 'Оплата',
        items: [
            {
                question: 'Які способи оплати ви приймаєте?',
                answer: 'Ми приймаємо оплату на карту (ПриватБанк, Monobank), накладений платіж, безготівковий розрахунок для юридичних осіб та оплату частинами.',
            },
            {
                question: 'Чи потрібна передоплата?',
                answer: 'Для замовлень до 5 000 ₴ передоплата не потрібна — ви можете оплатити при отриманні (накладений платіж). Для замовлень від 5 000 ₴ бажана передоплата 50%.',
            },
            {
                question: 'Чи можна оплатити частинами / в розстрочку?',
                answer: 'Так, для замовлень від 10 000 ₴ доступна розстрочка через ПриватБанк або Monobank. Також можлива оплата частинами — 50% при замовленні та 50% перед відправкою.',
            },
        ],
    },
    {
        title: 'Повернення та гарантія',
        items: [
            {
                question: 'Яка гарантія на меблі?',
                answer: 'Гарантія на всі наші меблі становить 12 місяців з моменту отримання. Гарантія поширюється на виробничі дефекти та не поширюється на пошкодження, спричинені неправильною експлуатацією.',
            },
            {
                question: 'Як повернути товар?',
                answer: 'Зв\'яжіться з нами протягом 14 днів з моменту отримання. Товар має бути у оригінальній упаковці, без слідів використання. Після узгодження — відправте товар назад, і ми повернемо кошти протягом 3-5 днів.',
            },
            {
                question: 'Що робити, якщо товар прийшов пошкодженим?',
                answer: 'Під час отримання обов\'язково перевірте цілісність упаковки та товару. У разі пошкоджень складіть акт у присутності представника перевізника та зв\'яжіться з нами протягом 24 годин. Ми оперативно вирішимо питання.',
            },
            {
                question: 'Чи можна обміняти товар на інший?',
                answer: 'Так, протягом 14 днів ви можете обміняти товар на аналогічний іншого кольору або розміру. Товар має бути в оригінальній упаковці без слідів використання.',
            },
        ],
    },
    {
        title: 'Збірка та догляд',
        items: [
            {
                question: 'Чи потрібна збірка меблів?',
                answer: 'Більшість наших меблів поставляються у розібраному вигляді з детальною інструкцією зі збирання та всією необхідною фурнітурою. Збірка проста і не потребує спеціальних інструментів.',
            },
            {
                question: 'Чи надаєте ви послугу збірки?',
                answer: 'На даний момент ми не надаємо послугу збірки. Рекомендуємо скористатися послугами місцевих майстрів або зібрати меблі самостійно за інструкцією.',
            },
            {
                question: 'Як доглядати за меблями?',
                answer: 'Протирайте поверхні м\'якою вологою тканиною. Уникайте абразивних засобів та надмірної вологи. Не ставте гарячі предмети без підставки. Для ламінованих поверхонь використовуйте спеціальні засоби для догляду за меблями.',
            },
        ],
    },
];

function FAQAccordion({ item }: { item: FAQItem }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-6 text-left group"
            >
                <span className="text-sm font-medium text-gray-900 group-hover:text-black pr-8">
                    {item.question}
                </span>
                <span className={`flex-shrink-0 w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-black border-black rotate-45' : 'group-hover:border-black'}`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className={`w-4 h-4 transition-colors ${isOpen ? 'text-white' : 'text-gray-400'}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}
            >
                <p className="text-sm text-gray-500 leading-relaxed pr-16">
                    {item.answer}
                </p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    return (
        <div className="bg-white text-black font-sans">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-6 lg:px-10 max-w-[1400px] mx-auto text-center">
                <div className="mb-4 inline-block border border-black px-3 py-1 text-[10px] uppercase tracking-widest">
                    Допомога
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-8">
                    Часті <span className="text-gray-300">Питання</span>
                </h1>
                <p className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed">
                    Відповіді на найпоширеніші питання про замовлення, доставку, оплату та повернення меблів.
                </p>
            </section>

            {/* FAQ Sections */}
            <section className="border-t border-gray-100 py-24 max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="max-w-3xl mx-auto">
                    {faqCategories.map((category, catIdx) => (
                        <div key={catIdx} className={catIdx > 0 ? 'mt-16' : ''}>
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-xl text-gray-300 font-bold">0{catIdx + 1}</span>
                                <h2 className="text-sm font-bold uppercase tracking-widest">{category.title}</h2>
                            </div>
                            <div>
                                {category.items.map((item, itemIdx) => (
                                    <FAQAccordion key={itemIdx} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#111] text-white py-24">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-6">
                        Не знайшли відповідь?
                    </p>
                    <h2 className="text-2xl font-bold uppercase mb-4">Зв&apos;яжіться з нами</h2>
                    <p className="text-sm text-gray-400 mb-8 max-w-lg mx-auto">
                        Наша команда підтримки готова допомогти вам з будь-яким питанням. Напишіть нам або зателефонуйте.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/contacts"
                            className="inline-block bg-white text-black text-xs uppercase tracking-widest px-8 py-4 hover:bg-gray-200 transition-colors"
                        >
                            Контакти
                        </Link>
                        <Link
                            href="/delivery"
                            className="inline-block border border-gray-700 text-white text-xs uppercase tracking-widest px-8 py-4 hover:border-white transition-colors"
                        >
                            Доставка
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
