'use client';

import React from 'react';

export default function AboutPage() {
    return (
        <div className="bg-white text-black font-sans">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-6 lg:px-10 max-w-[1400px] mx-auto text-center">
                <div className="mb-4 inline-block border border-black px-3 py-1 text-[10px] uppercase tracking-widest">
                    EST. 2007
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none mb-8">
                    Мистецтво<br />
                    <span className="text-gray-300">Інженерії</span> Меблів
                </h1>
                <p className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed">
                    Серйозний підхід до створення комфорту. Ми створюємо не просто меблі, ми створюємо атмосферу вашого дому.
                </p>
            </section>

            {/* Stats Section */}
            <section className="border-t border-b border-gray-100 py-16">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="pt-8 md:pt-0">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Рік заснування</p>
                        <div className="text-6xl md:text-7xl font-bold mb-2">2007</div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Досвід та традиції створення меблів</p>
                    </div>
                    <div className="pt-8 md:pt-0 md:pl-12">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Виробничі площі, м²</p>
                        <div className="text-6xl md:text-7xl font-bold mb-2">5000</div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Сучасне обладнання та технології</p>
                    </div>
                    <div className="pt-8 md:pt-0 md:pl-12">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Складські приміщення, м²</p>
                        <div className="text-6xl md:text-7xl font-bold mb-2">6000</div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Постійна наявність товарів на складі</p>
                    </div>
                </div>
            </section>

            {/* Principles Section */}
            <section className="py-24 max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold uppercase mx-auto max-w-full leading-tight">
                        Наші Принципи
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                    {/* 01 */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">01</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Преміальна якість</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Використання найкращих порід дерева та фурнітури від провідних світових виробників для створення вічних предметів інтер'єру.
                        </p>
                    </div>

                    {/* 02 */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">02</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Екологічні матеріали</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Ми дбаємо про здоров'я вашої родини, використовуючи лише сертифіковані натуральні компоненти та безпечні покриття.
                        </p>
                    </div>

                    {/* 03 */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">03</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Швидка доставка</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Власна логістична служба гарантує оперативність та цілісність доставки вашого замовлення безпосередньо до оселі.
                        </p>
                    </div>

                    {/* 04 */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="text-xl text-gray-300 mb-4">04</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Власне виробництво</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Ми — прямий виробник, що дозволяє нам гарантувати найвищу якість продукції та запропонувати чесні ціни без переплат.
                        </p>
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="bg-[#111] text-white py-24">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-16 text-center">
                        Наші партнери та постачальники
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32">

                        {/* Column 1: Equipment */}
                        <div>
                            <h3 className="text-sm font-bold uppercase mb-8 border-b border-gray-800 pb-4">Обладнання</h3>
                            <div className="space-y-8">
                                <div>
                                    <h4 className="font-bold text-lg mb-1">BIESSE <span className="text-[10px] font-normal text-gray-500 ml-2">ITALY</span></h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Високоточні верстати з ПК для обробки деревини.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">HOMAG GROUP <span className="text-[10px] font-normal text-gray-500 ml-2">GERMANY</span></h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Лідер у виробництві верстатів для деревообробки.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">KDT <span className="text-[10px] font-normal text-gray-500 ml-2">GLOBAL</span></h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Свердлильно-присадні та кромколицювальні центри.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">VITAP <span className="text-[10px] font-normal text-gray-500 ml-2">ITALY</span></h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Спеціалізоване обладнання для меблевих цехів.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">ALTENDORF <span className="text-[10px] font-normal text-gray-500 ml-2">GERMANY</span></h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Форматно-розкрійні верстати еталонної точності.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Materials */}
                        <div>
                            <h3 className="text-sm font-bold uppercase mb-8 border-b border-gray-800 pb-4">Матеріали та фурнітура</h3>
                            <div className="space-y-8">
                                <div>
                                    <h4 className="font-bold text-lg mb-1">SWISS KRONO</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Екологічно чисті плити ДСП та МДФ.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">KRONOSPAN</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Провідний виробник деревних листових матеріалів.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">HENKEL</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Безпечні клеї та герметики.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">DURANTE&VIVAN</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Високотехнологічні адгезиви для кромки.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">KROMAG</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Кромкові матеріали ідеального співпадіння декорів.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">HRANIPEX/HAFELE</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Преміальна фурнітура та комплектуючі.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
