'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    category: string;
    stock: number;
    badge: string | null;
    images: string;
    createdAt: string;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products', { cache: 'no-store' });
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                console.error('Failed to fetch products:', data);
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Ви впевнені, що хочете видалити цей товар?')) return;
        setDeleting(id);
        const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setProducts(products.filter(p => p.id !== id));
        } else {
            alert('Не вдалося видалити товар. Можливо, він є в замовленнях.');
        }
        setDeleting(null);
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const getFirstImage = (images: string) => {
        try {
            const arr = JSON.parse(images);
            return arr[0] || null;
        } catch {
            return null;
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Товари</h1>
                    <p className="text-sm text-gray-500 mt-1">{products.length} товарів</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Додати товар
                </Link>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Пошук по назві..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-[11px] uppercase tracking-widest text-gray-500 font-medium px-6 py-4">Товар</th>
                                <th className="text-left text-[11px] uppercase tracking-widest text-gray-500 font-medium px-6 py-4">Категорія</th>
                                <th className="text-left text-[11px] uppercase tracking-widest text-gray-500 font-medium px-6 py-4">Артикул</th>
                                <th className="text-left text-[11px] uppercase tracking-widest text-gray-500 font-medium px-6 py-4">Ціна</th>
                                <th className="text-left text-[11px] uppercase tracking-widest text-gray-500 font-medium px-6 py-4">Склад</th>
                                <th className="text-left text-[11px] uppercase tracking-widest text-gray-500 font-medium px-6 py-4">Бейдж</th>
                                <th className="text-right text-[11px] uppercase tracking-widest text-gray-500 font-medium px-6 py-4">Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((product) => {
                                const img = getFirstImage(product.images);
                                return (
                                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                    {img && (
                                                        <Image
                                                            src={img}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="48px"
                                                        />
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 capitalize">{product.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500 font-mono">{product.sku || '—'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium">{product.price.toLocaleString('uk-UA')} ₴</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.badge ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-gray-100">
                                                    {product.badge}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    className="text-xs font-medium text-gray-600 hover:text-black px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    Редагувати
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={deleting === product.id}
                                                    className="text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    {deleting === product.id ? '...' : 'Видалити'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            Товарів не знайдено
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
