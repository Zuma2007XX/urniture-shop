'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Collection {
    id: string;
    title: string;
    slug: string;
    image: string | null;
    isActive: boolean;
    _count: {
        products: number;
    };
}

export default function AdminCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/collections')
            .then(res => res.json())
            .then(data => {
                setCollections(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Видалити цю колекцію?')) return;

        const res = await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setCollections(collections.filter(c => c.id !== id));
        } else {
            alert('Помилка видалення');
        }
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        const res = await fetch(`/api/admin/collections/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !current })
        });
        if (res.ok) {
            setCollections(collections.map(c => c.id === id ? { ...c, isActive: !current } : c));
        }
    };

    if (loading) return <div className="p-8">Завантаження...</div>;

    return (
        <div className="max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Колекції</h1>
                    <p className="text-sm text-gray-500 mt-1">Керування колекціями товарів</p>
                </div>
                <Link
                    href="/admin/collections/new"
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    + Створити колекцію
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-medium">Зображення</th>
                            <th className="px-6 py-4 font-medium">Назва</th>
                            <th className="px-6 py-4 font-medium">Slug (URL)</th>
                            <th className="px-6 py-4 font-medium">Товарів</th>
                            <th className="px-6 py-4 font-medium">Активна</th>
                            <th className="px-6 py-4 font-medium text-right">Дії</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {collections.map((collection) => (
                            <tr key={collection.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 w-24">
                                    <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden relative">
                                        {collection.image ? (
                                            <Image src={collection.image} alt={collection.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">🖼</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">{collection.title}</td>
                                <td className="px-6 py-4 text-gray-500">{collection.slug}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                                        {collection._count.products}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleActive(collection.id, collection.isActive)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${collection.isActive ? 'bg-black' : 'bg-gray-200'}`}
                                    >
                                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${collection.isActive ? 'translate-x-4.5' : 'translate-x-1'}`} />
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/admin/collections/${collection.id}`}
                                        className="text-black font-medium hover:underline mr-4"
                                    >
                                        Ред.
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(collection.id)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {collections.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    Колекцій поки немає
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
