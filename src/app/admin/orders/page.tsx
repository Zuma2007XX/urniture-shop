'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: { name: string; sku?: string | null };
}

interface Order {
    id: string;
    orderNumber: string | null;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    status: string;
    total: number;
    createdAt: string;
    items: OrderItem[];
    deliveryMethod: string;
    city: string | null;
    branch: string | null;
    address: string | null;
    paymentMethod: string;
    read: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Нова', color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Підтверджена', color: 'bg-blue-100 text-blue-800' },
    processing: { label: 'В обробці', color: 'bg-purple-100 text-purple-800' },
    shipped: { label: 'Відправлена', color: 'bg-indigo-100 text-indigo-800' },
    completed: { label: 'Завершена', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Скасована', color: 'bg-red-100 text-red-800' },
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchOrders = (query: string = '') => {
        setLoading(true);
        const url = query ? `/api/admin/orders?search=${encodeURIComponent(query)}` : '/api/admin/orders';
        fetch(url)
            .then(r => r.json())
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchOrders(searchQuery);
    };

    const updateStatus = async (orderId: string, status: string) => {
        await fetch(`/api/admin/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    };

    const markAsRead = async (orderId: string) => {
        await fetch(`/api/admin/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ read: true }),
        });
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, read: true } : o));
        // Trigger sidebar refresh
        window.dispatchEvent(new CustomEvent('admin-refresh-counts'));
    };

    const toggleExpand = (order: Order) => {
        const isExpanding = expanded !== order.id;
        setExpanded(isExpanding ? order.id : null);
        if (isExpanding && !order.read) {
            markAsRead(order.id);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Замовлення</h1>
                    <p className="text-sm text-gray-500 mt-1">Заявки від клієнтів</p>
                </div>

                <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Пошук (номер, телефон, ім'я)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 text-sm transition-all bg-gray-50 hover:bg-white focus:bg-white"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => { setSearchQuery(''); fetchOrders(''); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                            </svg>
                        </button>
                    )}
                </form>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-gray-200">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                    </svg>
                    <p>Замовлень ще немає</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map(order => {
                        const st = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
                        const isExpanded = expanded === order.id;
                        return (
                            <div key={order.id} className={`bg-white border rounded-xl overflow-hidden transition-all ${order.read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/10'}`}>
                                {/* Header row */}
                                <div
                                    className="flex flex-wrap items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors group"
                                    onClick={() => toggleExpand(order)}
                                >
                                    {/* Unread indicator dot */}
                                    {!order.read && (
                                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" title="Нове замовлення" />
                                    )}

                                    {/* Order number badge */}
                                    <div className="flex-shrink-0 bg-black text-white rounded-lg px-3 py-1.5 text-sm font-black tracking-widest">
                                        #{order.orderNumber || order.id.slice(-6)}
                                    </div>

                                    {/* Client info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{order.firstName} {order.lastName}</p>
                                        <p className="text-xs text-gray-500">{order.phone}</p>
                                    </div>

                                    {/* Total */}
                                    <div className="text-sm font-bold">
                                        {order.total.toLocaleString('uk-UA')} ₴
                                    </div>

                                    {/* Status badge */}
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.color}`}>
                                        {st.label}
                                    </span>

                                    {/* Date */}
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                        {new Date(order.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>

                                    {/* Expand chevron */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-5 bg-gray-50">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {/* Items */}
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Товари</p>
                                                <ul className="space-y-2">
                                                    {order.items.map(item => (
                                                        <li key={item.id} className="text-sm flex justify-between gap-2">
                                                            <span className="line-clamp-2 text-gray-700">
                                                                {item.product.name}
                                                                {item.product.sku && <span className="text-gray-400 ml-1.5 whitespace-nowrap text-xs bg-gray-100 px-1.5 py-0.5 rounded-md">Арт: {item.product.sku}</span>}
                                                            </span>
                                                            <span className="text-gray-500 flex-shrink-0">{item.quantity} × {item.price.toLocaleString('uk-UA')} ₴</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Contact + Status control */}
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Контакти</p>
                                                <div className="space-y-1 mb-4">
                                                    <p className="text-sm"><span className="text-gray-400">Телефон:</span> <a href={`tel:${order.phone}`} className="font-medium hover:underline">{order.phone}</a></p>
                                                    {order.email && <p className="text-sm"><span className="text-gray-400">Email:</span> {order.email}</p>}
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Статус</p>
                                                    <select
                                                        value={order.status}
                                                        onChange={e => updateStatus(order.id, e.target.value)}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors hover:border-gray-300"
                                                    >
                                                        {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                                                            <option key={val} value={val}>{label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="mt-6">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const codFee = order.paymentMethod === 'cod' ? (20 + order.total * 0.02) : 0;
                                                            const finalTotal = order.total + codFee;
                                                            const itemsList = order.items.map(i => `- ${i.product.name} x ${i.quantity}`).join('\n');
                                                            const deliveryInfo = order.branch
                                                                ? `Нова Пошта (№${order.branch}), ${order.city}`
                                                                : `Адреса: ${order.city}, ${order.address}`;

                                                            const text = `✨ Вітаємо, ${order.firstName}! Дякуємо за замовлення #${order.orderNumber || order.id.slice(-6)} 📋\n\n` +
                                                                `📦 Товари:\n${itemsList}\n\n` +
                                                                `💰 Сума замовлення: ${order.total.toLocaleString('uk-UA')} ₴\n` +
                                                                (order.paymentMethod === 'cod' ? `💳 Комісія НП (20грн+2%): ${codFee.toLocaleString('uk-UA')} ₴\n` : '') +
                                                                `🚚 Доставка: ____ ₴\n` +
                                                                `💎 Разом до сплати: ____ ₴\n\n` +
                                                                `📍 Адреса доставки: ${deliveryInfo}\n\n` +
                                                                (order.paymentMethod === 'bank_transfer' ? `💳 Реквізити для оплати будуть надіслані окремим повідомленням.` : `💼 Оплата при отриманні.`);

                                                            navigator.clipboard.writeText(text);
                                                            alert('Текст для Viber скопійовано!');
                                                        }}
                                                        className="w-full flex items-center justify-center gap-2 bg-[#7360f2] hover:bg-[#6251d4] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
                                                    >
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M17.5 12a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-11 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5.5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                                        </svg>
                                                        Копіювати для Viber
                                                    </button>
                                                </div>

                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-6 mb-3">Доставка та Оплата</p>
                                                <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2">
                                                    <p className="text-sm">
                                                        <span className="text-gray-400">Доставка:</span>{' '}
                                                        <span className="font-medium">
                                                            {order.branch
                                                                ? `Нова Пошта (№${order.branch}), ${order.city}`
                                                                : `Адреса: ${order.city}, ${order.address}`}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="text-gray-400">Оплата:</span>{' '}
                                                        <span className="font-medium">
                                                            {order.paymentMethod === 'bank_transfer' ? 'На розрахунковий рахунок' : 'Післяплата (20грн + 2%)'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
