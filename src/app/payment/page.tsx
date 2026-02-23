'use client';

import React from 'react';
import Link from 'next/link';

export default function PaymentPage() {
    return (
        <div className="bg-white text-black font-sans">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-6 lg:px-10 max-w-[1400px] mx-auto text-center">
                <div className="mb-4 inline-block border border-black px-3 py-1 text-[10px] uppercase tracking-widest">
                    Допомога
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-8">
                    Оплата
                </h1>
                <p className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed">
                    Зручні та безпечні способи оплати. Обирайте той, що підходить саме вам.
                </p>
            </section>

            {/* Payment Methods */}
            <section className="border-t border-gray-100 py-24 max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold uppercase leading-tight">
                        Способи оплати
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                    {/* 01 */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">01</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Оплата на карту</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Переказ на банківську карту ПриватБанк або Monobank. Після оформлення замовлення менеджер надішле вам реквізити для оплати. Зручний та швидкий спосіб для будь-якого банку України.
                        </p>
                    </div>

                    {/* 02 */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">02</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Накладений платіж</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Оплата при отриманні товару у відділенні Нової Пошти або іншої транспортної компанії. Зверніть увагу: при накладеному платежі стягується додаткова комісія перевізника (зазвичай 20 ₴ + 2% від суми).
                        </p>
                    </div>

                    {/* 03 */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">03</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Безготівковий розрахунок</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Для юридичних осіб та ФОП — оплата за рахунком-фактурою на розрахунковий рахунок підприємства. Надаємо повний пакет бухгалтерських документів: рахунок, накладну, акт виконаних робіт.
                        </p>
                    </div>

                    {/* 04 */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">04</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Оплата частинами</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Можливість розбити платіж на частини. Передоплата 50% при оформленні замовлення, решта — перед відправкою. Для замовлень від 10 000 ₴ доступна розстрочка через ПриватБанк або Monobank.
                        </p>
                    </div>
                </div>
            </section>

            {/* Guarantees Section */}
            <section className="bg-[#111] text-white py-24">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-16 text-center">
                        Гарантії безпеки
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 border border-gray-700 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-3">Безпечні платежі</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Усі транзакції захищені. Ми не зберігаємо дані ваших банківських карт.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 border border-gray-700 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-3">Документи</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                До кожного замовлення надаємо чек, гарантійний талон та всю необхідну документацію.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 border border-gray-700 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-3">Конфіденційність</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Ваші персональні дані надійно захищені та не передаються третім особам.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
                <h2 className="text-2xl font-bold uppercase mb-4">Потрібна допомога з оплатою?</h2>
                <p className="text-sm text-gray-500 mb-8 max-w-lg mx-auto">
                    Наші менеджери допоможуть обрати зручний спосіб оплати та відповідять на всі питання.
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
