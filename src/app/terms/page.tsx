'use client';

import React from 'react';

export default function TermsPage() {
    return (
        <div className="bg-white text-black font-sans">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-6 lg:px-10 max-w-[1400px] mx-auto text-center">
                <div className="mb-4 inline-block border border-black px-3 py-1 text-[10px] uppercase tracking-widest">
                    Документи
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-8">
                    Умови<br />
                    <span className="text-gray-300">Використання</span>
                </h1>
                <p className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed">
                    Правила та умови використання інтернет-магазину SM Furniture Store.
                </p>
            </section>

            {/* Content */}
            <section className="border-t border-gray-100 py-24 max-w-[900px] mx-auto px-6 lg:px-10">
                <div className="space-y-16">
                    {/* 1 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">01</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Загальні положення</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>
                                Ці Умови використання (далі — «Умови») регулюють відносини між інтернет-магазином SM Furniture Store (далі — «Продавець») та фізичною або юридичною особою (далі — «Покупець»), яка здійснює замовлення товарів через сайт.
                            </p>
                            <p>
                                Оформлюючи замовлення на сайті, Покупець підтверджує, що ознайомився та погоджується з цими Умовами використання.
                            </p>
                        </div>
                    </div>

                    {/* 2 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">02</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Оформлення замовлення</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>
                                Замовлення оформлюється через сайт, за телефоном або через месенджери. Після оформлення замовлення Покупець отримує підтвердження з деталями замовлення.
                            </p>
                            <ul className="space-y-2 ml-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Ціни на товари вказані у гривнях та включають ПДВ</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Продавець залишає за собою право змінювати ціни без попереднього повідомлення</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Ціна фіксується на момент оформлення замовлення</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Вартість доставки не включена у ціну товару</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 3 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">03</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Оплата та доставка</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>
                                Способи оплати та умови доставки детально описані на відповідних сторінках сайту. Продавець зобов&apos;язується відправити товар у погоджені терміни після підтвердження оплати.
                            </p>
                            <p>
                                У разі відсутності товару на складі Продавець зобов&apos;язується повідомити Покупця та запропонувати альтернативні варіанти або повернути кошти.
                            </p>
                        </div>
                    </div>

                    {/* 4 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">04</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Гарантія та якість</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>
                                На всі товари надається гарантія виробника терміном 12 місяців з дати отримання. Гарантія поширюється на виробничі дефекти та не покриває:
                            </p>
                            <ul className="space-y-2 ml-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Механічні пошкодження, що виникли з вини Покупця</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Пошкодження внаслідок неправильної експлуатації або збирання</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Природне зношування матеріалів</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Пошкодження, спричинені впливом вологи, високих температур або прямих сонячних променів</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 5 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">05</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Повернення та обмін</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>
                                Повернення та обмін товарів здійснюється відповідно до Закону України «Про захист прав споживачів». Детальні умови повернення описані на сторінці «Повернення».
                            </p>
                            <p>
                                Покупець має право повернути товар належної якості протягом 14 днів з моменту отримання за умови збереження товарного вигляду, споживчих властивостей та оригінальної упаковки.
                            </p>
                        </div>
                    </div>

                    {/* 6 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">06</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Інтелектуальна власність</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>
                                Усі матеріали, розміщені на сайті (тексти, зображення, логотипи, дизайн), є інтелектуальною власністю Продавця та захищені законодавством про авторське право.
                            </p>
                            <p>
                                Копіювання, розповсюдження або використання матеріалів сайту без письмової згоди Продавця заборонено.
                            </p>
                        </div>
                    </div>

                    {/* 7 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">07</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Відповідальність сторін</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>
                                Продавець не несе відповідальності за неможливість виконання замовлення з причин, що не залежать від нього (форс-мажорні обставини, збої у роботі транспортних компаній тощо).
                            </p>
                            <p>
                                Покупець несе відповідальність за достовірність наданих персональних даних при оформленні замовлення.
                            </p>
                        </div>
                    </div>

                    {/* 8 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">08</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Зміни до умов</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>
                                Продавець залишає за собою право вносити зміни до цих Умов використання без попереднього повідомлення. Актуальна версія завжди доступна на цій сторінці.
                            </p>
                            <p className="text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100">
                                Останнє оновлення: лютий 2026 року
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
