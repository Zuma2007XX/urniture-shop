'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'pending': return { label: 'Очікує підтвердження', style: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        case 'confirmed': return { label: 'Підтверджено', style: 'bg-blue-100 text-blue-800 border-blue-200' };
        case 'processing': return { label: 'В роботі', style: 'bg-purple-100 text-purple-800 border-purple-200' };
        case 'shipped': return { label: 'Відправлено', style: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
        case 'completed': return { label: 'Виконано', style: 'bg-green-100 text-green-800 border-green-200' };
        case 'cancelled': return { label: 'Скасовано', style: 'bg-red-100 text-red-800 border-red-200' };
        default: return { label: status, style: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
};

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (status === 'authenticated') {
            fetch('/api/user/orders')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setOrders(data);
                    }
                })
                .catch(console.error)
                .finally(() => setLoadingOrders(false));
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!session?.user) {
        return null; // Will redirect in useEffect
    }

    const { user } = session;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Особистий кабінет</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Керуйте своїми даними та переглядайте історію замовлень
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Sidebar - Profile Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 overflow-hidden border-2 border-white shadow-md">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || 'User avatar'} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl text-gray-400 font-bold">
                                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-lg font-bold text-gray-900">{user.name || 'Користувач'}</h2>
                            <p className="text-sm text-gray-500 mt-1 truncate max-w-full" title={user.email || ''}>
                                {user.email}
                            </p>

                            {user.role === 'admin' && (
                                <span className="mt-3 inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                                    Адміністратор
                                </span>
                            )}

                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-gray-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                                Вийти
                            </button>
                        </div>

                        {/* Admin Link if applicable */}
                        {user.role === 'admin' && (
                            <Link href="/admin" className="block bg-black text-white rounded-2xl p-6 shadow-sm border border-gray-800 hover:bg-gray-900 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm">Панель управління</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Right Content - Order History */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full min-h-[400px]">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12.636A1.125 1.125 0 0119.747 22.5H4.253a1.125 1.125 0 01-1.122-1.233L4.394 8.514a1.125 1.125 0 011.122-1.007h12.968a1.125 1.125 0 011.122 1.007z" />
                                </svg>
                                Історія замовлень
                            </h3>

                            {loadingOrders ? (
                                <div className="flex items-center justify-center h-full pt-12 pb-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center h-full pt-12 pb-20">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-gray-300">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-900">У вас поки немає замовлень</h4>
                                    <p className="mt-2 text-sm text-gray-500 max-w-[250px]">
                                        Коли ви оформите своє перше замовлення, воно з'явиться тут.
                                    </p>
                                    <Link
                                        href="/catalog"
                                        className="mt-8 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
                                    >
                                        Перейти до каталогу
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {orders.map((order) => {
                                        const statusInfo = getStatusLabel(order.status);
                                        return (
                                            <div key={order.id} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-gray-50/50">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Замовлення #{order.orderNumber || order.id.slice(-6).toUpperCase()}</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {new Date(order.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.style} flex-shrink-0 w-fit`}>
                                                        {statusInfo.label}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {order.items.map((item: any) => {
                                                        let imageUrl = null;
                                                        try {
                                                            if (item.product?.images) {
                                                                const parsed = JSON.parse(item.product.images);
                                                                if (parsed.length > 0) imageUrl = parsed[0];
                                                            }
                                                        } catch (e) { }

                                                        return (
                                                            <div key={item.id} className="flex items-center gap-4">
                                                                <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-1 flex-shrink-0">
                                                                    {imageUrl ? (
                                                                        <img
                                                                            src={imageUrl}
                                                                            alt={item.product?.name || 'Товар'}
                                                                            className="w-full h-full object-contain"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Фото</div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h5 className="text-sm font-medium text-gray-900 truncate">{item.product?.name || 'Товар видалено'}</h5>
                                                                    {item.colorName && (
                                                                        <p className="text-xs text-gray-500 mt-0.5">Колір: {item.colorName}</p>
                                                                    )}
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <p className="text-sm font-medium text-gray-900">{item.price.toLocaleString('uk-UA')} ₴</p>
                                                                    <p className="text-xs text-gray-500 mt-0.5">{item.quantity} шт.</p>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-500">Загальна сума:</span>
                                                    <span className="text-lg font-bold text-gray-900">{order.total.toLocaleString('uk-UA')} ₴</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
