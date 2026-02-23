'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/products')
            .then(r => r.json())
            .then(products => {
                setStats({
                    products: products.length,
                    orders: 0,
                    revenue: 0,
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
                <p className="text-sm text-gray-500 mt-1">Огляд магазину SM</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-2">Товарів</p>
                    <p className="text-3xl font-bold">{loading ? '—' : stats.products}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-2">Замовлень</p>
                    <p className="text-3xl font-bold">{loading ? '—' : stats.orders}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-2">Дохід</p>
                    <p className="text-3xl font-bold">{loading ? '—' : `${stats.revenue.toLocaleString('uk-UA')} ₴`}</p>
                </div>
            </div>

            {/* Quick actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Швидкі дії</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/admin/products/new"
                        className="bg-white rounded-xl p-5 border border-gray-100 hover:border-black transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold group-hover:underline">Додати товар</p>
                                <p className="text-xs text-gray-500">Створити новий товар</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/products"
                        className="bg-white rounded-xl p-5 border border-gray-100 hover:border-black transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold group-hover:underline">Управління товарами</p>
                                <p className="text-xs text-gray-500">Редагувати або видалити</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/content"
                        className="bg-white rounded-xl p-5 border border-gray-100 hover:border-black transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold group-hover:underline">Контент сайту</p>
                                <p className="text-xs text-gray-500">Банер, колекції, тексти</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
