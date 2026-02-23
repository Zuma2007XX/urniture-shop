'use client';

import React from 'react';
import Link from 'next/link';

export default function DeliveryPage() {
    return (
        <div className="bg-white text-black font-sans">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-6 lg:px-10 max-w-[1400px] mx-auto text-center">
                <div className="mb-4 inline-block border border-black px-3 py-1 text-[10px] uppercase tracking-widest">
                    Допомога
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-8">
                    Доставка
                </h1>
                <p className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed">
                    Доставляємо меблі по всій Україні. Обережно пакуємо та гарантуємо цілісність кожного виробу.
                </p>
            </section>

            {/* Delivery Methods */}
            <section className="border-t border-gray-100 py-24 max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold uppercase leading-tight">
                        Способи доставки
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Method 1 */}
                    <div className="border border-gray-100 p-8 hover:border-black transition-colors">
                        <div className="text-xl text-gray-300 mb-4">01</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Нова Пошта</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            Доставка у будь-яке відділення або поштомат Нової Пошти по всій Україні.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li className="flex items-start gap-2">
                                <span className="text-black mt-0.5">—</span>
                                <span>Термін: 1-3 робочих дні</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-black mt-0.5">—</span>
                                <span>Вартість: за тарифами перевізника</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-black mt-0.5">—</span>
                                <span>Адресна доставка до дверей</span>
                            </li>
                        </ul>
                    </div>

                    {/* Method 2 */}
                    <div className="border border-gray-100 p-8 hover:border-black transition-colors">
                        <div className="text-xl text-gray-300 mb-4">02</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Delivery</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            Альтернативна доставка через транспортну компанію Delivery для великогабаритних замовлень.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li className="flex items-start gap-2">
                                <span className="text-black mt-0.5">—</span>
                                <span>Термін: 2-5 робочих днів</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-black mt-0.5">—</span>
                                <span>Вартість: за тарифами перевізника</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-black mt-0.5">—</span>
                                <span>Ідеально для великих меблів</span>
                            </li>
                        </ul>
                    </div>

                    {/* Method 3 */}
                    <div className="border border-gray-100 p-8 hover:border-black transition-colors">
                        <div className="text-xl text-gray-300 mb-4">03</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Самовивіз</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            Ви можете самостійно забрати замовлення з нашого складу у м. Запоріжжя.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li className="flex items-start gap-2">
                                <span className="text-black mt-0.5">—</span>
                                <span>Безкоштовно</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-black mt-0.5">—</span>
                                <span>Пн-Пт: 9:00 – 18:00</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-black mt-0.5">—</span>
                                <span>Попереднє узгодження дати</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Important Info */}
            <section className="bg-[#111] text-white py-24">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-16 text-center">
                        Важлива інформація
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32">
                        <div>
                            <h3 className="text-sm font-bold uppercase mb-8 border-b border-gray-800 pb-4">Підготовка до доставки</h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Упаковка</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Усі меблі ретельно пакуються у гофрокартон та захисну плівку для запобігання пошкоджень під час транспортування.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Перевірка замовлення</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Перед відправкою кожне замовлення проходить контроль якості та комплектності.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Відстеження</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Після відправки ви отримаєте ТТН для відстеження замовлення в реальному часі.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold uppercase mb-8 border-b border-gray-800 pb-4">При отриманні</h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Огляд</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Обов&apos;язково перевірте цілісність упаковки та товару при отриманні. У разі пошкоджень — зафіксуйте акт у перевізника.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Комплектація</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Перевірте наявність усіх деталей, фурнітури та інструкції зі збирання відповідно до комплектації.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Підтримка</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Якщо виникли питання або проблеми з доставкою — зверніться до нашої служби підтримки за телефоном або у Telegram.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
                <h2 className="text-2xl font-bold uppercase mb-4">Маєте питання щодо доставки?</h2>
                <p className="text-sm text-gray-500 mb-8 max-w-lg mx-auto">
                    Зв&apos;яжіться з нами — ми з радістю допоможемо з будь-яких питань щодо доставки вашого замовлення.
                </p>
                <Link
                    href="/contacts"
                    className="inline-block bg-black text-white text-xs uppercase tracking-widest px-8 py-4 hover:bg-gray-800 transition-colors"
                >
                    Зв&apos;язатись з нами
                </Link>
            </section>
        </div>
    );
}
