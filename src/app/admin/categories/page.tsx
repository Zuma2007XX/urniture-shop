'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    _count?: {
        products: number;
    }
}

export default function AdminCategories() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Category | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '', image: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (!res.ok) {
                console.error('API Error:', res.status, res.statusText);
                const errData = await res.json();
                console.error('API Response:', errData);
                throw new Error(errData.error || 'Failed to fetch');
            }
            const data = await res.json();
            console.log('Fetched categories:', data);
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                console.warn('Data is not array:', data);
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const url = editing ? `/api/categories/${editing.id}` : '/api/categories';
            const method = editing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Something went wrong');
            }

            await fetchCategories();
            setIsFormOpen(false);
            setEditing(null);
            setFormData({ name: '', slug: '', image: '' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, productCount: number = 0) => {
        if (productCount > 0) {
            if (!confirm(`Ця категорія містить ${productCount} товарів. Видалити її? Товари залишаться без категорії.`)) return;
        } else {
            if (!confirm('Видалити цю категорію?')) return;
        }

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            alert('Помилка видалення');
        }
    };

    const openEdit = (category: Category) => {
        setEditing(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            image: category.image || '',
        });
        setIsFormOpen(true);
    };

    const openNew = () => {
        setEditing(null);
        setFormData({ name: '', slug: '', image: '' });
        setIsFormOpen(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Категорії</h1>
                    <p className="text-sm text-gray-500 mt-1">{categories.length} категорій</p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Додати категорію
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    Помилка завантаження: {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <div key={category.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow group relative">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-lg">{category.name}</h3>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono">
                                    {category.slug}
                                </span>
                            </div>

                            <div className="text-sm text-gray-500 mb-4">
                                {category._count?.products || 0} товарів
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => openEdit(category)}
                                    className="text-xs font-medium text-gray-600 hover:text-black hover:underline"
                                >
                                    Редагувати
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id, category._count?.products)}
                                    className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                                >
                                    Видалити
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal / Form Overlay */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-xl font-bold mb-6">
                            {editing ? 'Редагувати категорію' : 'Нова категорія'}
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            name: e.target.value,
                                            // Auto-generate slug if empty or new
                                            slug: (!editing && !prev.slug) ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_') : prev.slug
                                        }));
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black"
                                    placeholder="Наприклад: Дивани"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (ID для URL)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black font-mono text-sm"
                                    placeholder="sofas"
                                />
                                <p className="text-xs text-gray-400 mt-1">Унікальний ідентифікатор, використовується в URL.</p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 bg-white text-gray-700"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {submitting ? 'Збереження...' : 'Зберегти'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
