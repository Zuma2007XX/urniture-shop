'use client';

import React from 'react';
import Link from 'next/link';

export default function ReturnsPage() {
    return (
        <div className="bg-white text-black font-sans">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-6 lg:px-10 max-w-[1400px] mx-auto text-center">
                <div className="mb-4 inline-block border border-black px-3 py-1 text-[10px] uppercase tracking-widest">
                    Допомога
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-8">
                    Повернення
                </h1>
                <p className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed">
                    Ми цінуємо вашу довіру. Якщо товар не підійшов — ми гарантуємо простий та прозорий процес повернення.
                </p>
            </section>

            {/* Return Policy */}
            <section className="border-t border-gray-100 py-24 max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold uppercase leading-tight">
                        Умови повернення
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {/* Stat 1 */}
                    <div className="text-center border border-gray-100 p-8">
                        <div className="text-5xl md:text-6xl font-bold mb-3">14</div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Днів</p>
                        <p className="text-sm text-gray-500">
                            На повернення товару належної якості з моменту отримання
                        </p>
                    </div>

                    {/* Stat 2 */}
                    <div className="text-center border border-gray-100 p-8">
                        <div className="text-5xl md:text-6xl font-bold mb-3">100%</div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Повернення коштів</p>
                        <p className="text-sm text-gray-500">
                            Повна компенсація вартості товару при дотриманні умов повернення
                        </p>
                    </div>

                    {/* Stat 3 */}
                    <div className="text-center border border-gray-100 p-8">
                        <div className="text-5xl md:text-6xl font-bold mb-3">3-5</div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Робочих днів</p>
                        <p className="text-sm text-gray-500">
                            Термін повернення коштів після отримання товару назад
                        </p>
                    </div>
                </div>

                {/* Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">01</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Товар належної якості</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Повернення можливе протягом 14 днів з моменту отримання, якщо товар не був у використанні, збережено його товарний вигляд, споживчі властивості, пломби, ярлики та оригінальну упаковку.
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">02</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Товар неналежної якості</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Якщо ви виявили виробничий дефект або пошкодження — зверніться до нас протягом гарантійного терміну. Ми замінимо товар або повернемо кошти. Гарантія на меблі становить 12 місяців.
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">03</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Обмін товару</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Якщо товар не підійшов за розміром, кольором або комплектацією — ви можете обміняти його на аналогічний протягом 14 днів. Різниця у вартості компенсується або доплачується.
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">04</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Пошкодження при доставці</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            При виявленні пошкоджень під час отримання обов&apos;язково складіть акт у присутності представника перевізника та зверніться до нас протягом 24 годин. Ми оперативно вирішимо питання.
                        </p>
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="bg-[#111] text-white py-24">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-16 text-center">
                        Як це працює
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-3xl font-bold text-gray-700 mb-4">01</div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-3">Заявка</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Зв&apos;яжіться з нами по телефону, email або у Telegram та повідомте про бажання повернути товар.
                            </p>
                        </div>

                        <div>
                            <div className="text-3xl font-bold text-gray-700 mb-4">02</div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-3">Узгодження</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Менеджер перевірить умови повернення та надасть інструкції щодо відправки товару назад.
                            </p>
                        </div>

                        <div>
                            <div className="text-3xl font-bold text-gray-700 mb-4">03</div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-3">Відправка</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Відправте товар у оригінальній упаковці за вказаною адресою. Вартість зворотної доставки за рахунок покупця.
                            </p>
                        </div>

                        <div>
                            <div className="text-3xl font-bold text-gray-700 mb-4">04</div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-3">Повернення коштів</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Після перевірки товару ми повернемо кошти на вашу банківську карту протягом 3-5 робочих днів.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
                <h2 className="text-2xl font-bold uppercase mb-4">Потрібна допомога з поверненням?</h2>
                <p className="text-sm text-gray-500 mb-8 max-w-lg mx-auto">
                    Наша служба підтримки допоможе вам на кожному етапі процесу повернення або обміну товару.
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
