'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import {
    TrendingUp,
    ShoppingCart,
    DollarSign,
    ChevronDown,
    ChevronUp,
    Package,
    BarChart3,
    History
} from 'lucide-react';
import Image from 'next/image';

export default function SalesPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'daily' | 'analytics'>('daily');
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/sales')
            .then(async r => {
                const res = await r.json();
                if (!r.ok || res.error) throw new Error(res.error || 'Failed to fetch');
                return res;
            })
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!data) return null;

    const maxRevenue = Math.max(...data.daily.map((d: any) => d.revenue), 1000);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Продажі та Аналітика</h1>
                    <p className="text-sm text-gray-500 mt-1">Огляд ефективності за останні 30 днів</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm w-fit">
                    <button
                        onClick={() => setActiveTab('daily')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'daily' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                    >
                        <History className="w-4 h-4" />
                        Щоденно
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Аналітика
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Виручка (30д)</p>
                    </div>
                    <p className="text-3xl font-black">{data.summary.totalRevenue.toLocaleString('uk-UA')} ₴</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Замовлень (30д)</p>
                    </div>
                    <p className="text-3xl font-black">{data.summary.totalOrders}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Сер. чек</p>
                    </div>
                    <p className="text-3xl font-black">{Math.round(data.summary.avgOrderValue).toLocaleString('uk-UA')} ₴</p>
                </div>
            </div>

            {activeTab === 'daily' ? (
                <div className="space-y-8">
                    {/* Chart Card */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-gray-400" />
                            Графік продажів
                        </h3>

                        <div className="h-[250px] w-full flex items-end gap-1.5 md:gap-3">
                            {data.daily.map((day: any) => (
                                <div
                                    key={day.date}
                                    className="flex-1 group relative flex flex-col items-center justify-end h-full"
                                    onClick={() => setSelectedDay(selectedDay === day.date ? null : day.date)}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 bg-black text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                        {format(parseISO(day.date), 'd MMM', { locale: uk })}: {day.revenue.toLocaleString('uk-UA')} ₴
                                    </div>

                                    <div
                                        className={`w-full rounded-t-lg transition-all cursor-pointer ${selectedDay === day.date ? 'bg-black' : 'bg-gray-100 group-hover:bg-gray-200'}`}
                                        style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, day.revenue > 0 ? 4 : 0)}%` }}
                                    />

                                    <div className="mt-2 text-[8px] md:text-[10px] text-gray-400 font-medium rotate-45 origin-left md:rotate-0 md:origin-center">
                                        {format(parseISO(day.date), 'dd')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daily Orders List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Історія по днях</h3>
                            <button className="text-sm font-semibold text-gray-400 hover:text-black">Останні 30 днів</button>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {data.daily.filter((d: any) => d.count > 0).map((day: any) => (
                                <div key={day.date} className="overflow-hidden">
                                    <button
                                        onClick={() => setSelectedDay(selectedDay === day.date ? null : day.date)}
                                        className={`w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${selectedDay === day.date ? 'bg-gray-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex flex-col items-center justify-center shadow-sm">
                                                <span className="text-[10px] text-gray-400 font-black uppercase leading-none mb-0.5">{format(parseISO(day.date), 'MMM', { locale: uk })}</span>
                                                <span className="text-base font-black leading-none">{format(parseISO(day.date), 'dd')}</span>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900">{day.revenue.toLocaleString('uk-UA')} ₴</p>
                                                <p className="text-xs text-gray-500 font-medium">{day.count} {day.count === 1 ? 'замовлення' : 'замовлень'}</p>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-lg transition-colors ${selectedDay === day.date ? 'bg-black text-white' : 'text-gray-400'}`}>
                                            {selectedDay === day.date ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </button>

                                    {selectedDay === day.date && (
                                        <div className="bg-gray-50/50 p-5 px-8 border-t border-gray-50">
                                            <div className="space-y-4">
                                                {day.orders.map((order: any) => (
                                                    <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center font-bold text-xs">
                                                                #{order.orderNumber || order.id.slice(-4)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold">{order.firstName} {order.lastName}</p>
                                                                <p className="text-xs text-gray-500">{order.items.length} тов. • {order.paymentMethod === 'cod' ? 'Післяплата' : 'Рахунок'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6 justify-between md:justify-end">
                                                            <div className="text-right">
                                                                <p className="text-sm font-black">{order.total.toLocaleString('uk-UA')} ₴</p>
                                                                <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>

                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="text-lg font-bold">Топ продаваних товарів</h3>
                        <p className="text-xs text-gray-500 mt-1">Рейтинг за весь час</p>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {data.topProducts.map((product: any, index: number) => (
                            <div key={product.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 shrink-0">
                                        {index + 1}
                                    </div>

                                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 relative">
                                        {product.image ? (
                                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-200" /></div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                                        <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-black rounded-full"
                                                style={{ width: `${(product.quantity / data.topProducts[0].quantity) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10 text-right">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Кількість</p>
                                        <p className="text-lg font-black">{product.quantity}</p>
                                    </div>
                                    <div className="min-w-[120px]">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Сума</p>
                                        <p className="text-lg font-black">{product.revenue.toLocaleString('uk-UA')} ₴</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
