'use client';

import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="bg-white text-black font-sans">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-6 lg:px-10 max-w-[1400px] mx-auto text-center">
                <div className="mb-4 inline-block border border-black px-3 py-1 text-[10px] uppercase tracking-widest">
                    Документи
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-8">
                    Політика<br />
                    <span className="text-gray-300">Конфіденційності</span>
                </h1>
                <p className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed">
                    Ми дбаємо про захист ваших персональних даних та дотримуємося чинного законодавства України.
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
                                Ця Політика конфіденційності визначає порядок збору, зберігання, використання та захисту персональних даних користувачів інтернет-магазину SM Furniture Store (далі — «Магазин»).
                            </p>
                            <p>
                                Використовуючи наш сайт та здійснюючи замовлення, ви погоджуєтесь з умовами цієї Політики конфіденційності та надаєте згоду на обробку ваших персональних даних відповідно до Закону України «Про захист персональних даних».
                            </p>
                        </div>
                    </div>

                    {/* 2 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">02</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Які дані ми збираємо</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>Ми можемо збирати наступні персональні дані:</p>
                            <ul className="space-y-2 ml-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Прізвище, ім&apos;я та по батькові</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Контактний номер телефону</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Адреса електронної пошти</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Адреса доставки</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Дані про замовлення та історія покупок</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>IP-адреса та дані cookies</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 3 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">03</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Мета збору даних</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>Ваші персональні дані використовуються для:</p>
                            <ul className="space-y-2 ml-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Оформлення та обробки замовлень</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Зв&apos;язку з вами щодо статусу замовлення</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Доставки товарів за вказаною адресою</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Покращення якості обслуговування та роботи сайту</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Надсилання інформації про акції та новинки (за вашою згодою)</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 4 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">04</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Захист даних</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>
                                Ми вживаємо всіх необхідних організаційних та технічних заходів для захисту ваших персональних даних від несанкціонованого доступу, зміни, розкриття або знищення.
                            </p>
                            <p>
                                Доступ до персональних даних мають лише уповноважені працівники, які потребують цієї інформації для виконання своїх обов&apos;язків.
                            </p>
                        </div>
                    </div>

                    {/* 5 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">05</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Передача даних третім особам</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>
                                Ми не продаємо, не обмінюємо та не передаємо ваші персональні дані третім особам без вашої згоди, за винятком випадків, необхідних для виконання замовлення:
                            </p>
                            <ul className="space-y-2 ml-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Передача даних транспортним компаніям для доставки замовлення</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Передача даних платіжним системам для обробки оплати</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Надання інформації на вимогу уповноважених державних органів відповідно до законодавства</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 6 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">06</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Файли Cookies</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>
                                Наш сайт використовує файли cookies для забезпечення коректної роботи, збереження налаштувань користувача та аналітики відвідуваності. Ви можете налаштувати свій браузер для блокування cookies, однак це може вплинути на функціональність сайту.
                            </p>
                        </div>
                    </div>

                    {/* 7 */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xl text-gray-300 font-bold">07</span>
                            <h2 className="text-sm font-bold uppercase tracking-widest">Ваші права</h2>
                        </div>
                        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                            <p>Відповідно до законодавства України, ви маєте право:</p>
                            <ul className="space-y-2 ml-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Знати про джерела збору, місцезнаходження своїх персональних даних</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Отримувати інформацію про обробку своїх персональних даних</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Вимагати виправлення або видалення своїх персональних даних</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black mt-0.5">—</span>
                                    <span>Відкликати згоду на обробку персональних даних</span>
                                </li>
                            </ul>
                            <p>
                                Для реалізації цих прав зверніться до нас за електронною адресою або за телефоном, вказаними на сторінці контактів.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
