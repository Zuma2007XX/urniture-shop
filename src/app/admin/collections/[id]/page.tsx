'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function EditCollectionPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Bulk Color Update State
    const [availableColors, setAvailableColors] = useState<{ id: string; name: string; image: string }[]>([]);

    type ColorVariant = { name: string; images: string[] };
    const [bulkVariants, setBulkVariants] = useState<ColorVariant[]>([]);
    const [bulkColors, setBulkColors] = useState<string[]>([]); // Keep for backward compat if needed, or remove
    const [bulkUpdating, setBulkUpdating] = useState(false);

    // Bulk Variant Handlers
    const addBulkVariant = () => {
        setBulkVariants([...bulkVariants, { name: '', images: [] }]);
    };

    const removeBulkVariant = (index: number) => {
        setBulkVariants(bulkVariants.filter((_, i) => i !== index));
    };

    const toggleColorInVariant = (vIndex: number, color: { id: string; name: string; image: string }) => {
        setBulkVariants(prev => {
            const newVariants = [...prev];
            const currentImages = newVariants[vIndex].images;

            let newImages: string[];
            if (currentImages.includes(color.image)) {
                newImages = currentImages.filter(img => img !== color.image);
            } else {
                if (currentImages.length >= 2) return prev; // Max 2
                newImages = [...currentImages, color.image];
            }

            // Auto-generate name based on selected images
            const names = newImages.map(img => availableColors.find(c => c.image === img)?.name).filter(Boolean);
            const newName = names.join(' + ');

            newVariants[vIndex] = { ...newVariants[vIndex], images: newImages, name: newName };
            return newVariants;
        });
    };

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        image: '',
        products: [] as string[],
    });

    useEffect(() => {
        // Fetch collection and all products
        const fetchData = async () => {
            try {
                const [collectionRes, productsRes, colorsRes] = await Promise.all([
                    fetch(`/api/admin/collections/${id}`),
                    fetch('/api/admin/products'),
                    fetch('/api/admin/colors')
                ]);

                const collection = await collectionRes.json();
                const products = await productsRes.json();
                const colors = await colorsRes.json();

                if (collection.error) throw new Error(collection.error);

                // Identify products already in this collection
                const currentProductIds = products
                    .filter((p: any) => p.collectionId === id)
                    .map((p: any) => p.id);

                setFormData({
                    title: collection.title,
                    slug: collection.slug,
                    description: collection.description || '',
                    image: collection.image || '',
                    products: currentProductIds,
                });

                // Initialize bulkVariants from collection data if available
                if (collection.variants) {
                    try {
                        const parsedVariants = JSON.parse(collection.variants);
                        if (Array.isArray(parsedVariants)) {
                            setBulkVariants(parsedVariants);
                        }
                    } catch (e) {
                        console.error('Failed to parse collection variants', e);
                    }
                }

                setAllProducts(products);
                setAvailableColors(Array.isArray(colors) ? colors : []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert('Помилка завантаження');
                router.push('/admin/collections');
            }
        };

        if (id) fetchData();
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProductToggle = (productId: string) => {
        setFormData(prev => {
            const exists = prev.products.includes(productId);
            return {
                ...prev,
                products: exists
                    ? prev.products.filter(id => id !== productId)
                    : [...prev.products, productId]
            };
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
            const json = await res.json();
            if (json.url) {
                setFormData(prev => ({ ...prev, image: json.url }));
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Помилка завантаження фото');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/collections/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/collections');
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            alert('Помилка оновлення колекції');
        } finally {
            setSaving(false);
        }
    };

    const handleBulkColorUpdate = async () => {
        if (!confirm('Ви впевнені? Це замінить кольори у ВСІХ товарах цієї колекції на ці варіанти.')) return;

        // Filter out empty variants
        const validVariants = bulkVariants.filter(v => v.images.length > 0);
        if (validVariants.length === 0) {
            alert('Будь ласка, додайте хоча б один варіант кольору.');
            return;
        }

        setBulkUpdating(true);
        try {
            const res = await fetch(`/api/admin/collections/${id}/bulk-colors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ colors: validVariants }), // Send variant objects
            });

            const data = await res.json();

            if (res.ok) {
                alert('Кольори (варіанти) успішно оновлено!');
            } else {
                throw new Error(data.error || 'Failed');
            }
        } catch (error) {
            console.error(error);
            alert(`Помилка масового оновлення: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setBulkUpdating(false);
        }
    };

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8">Завантаження...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/collections" className="text-gray-500 hover:text-black">
                    ← Назад
                </Link>
                <h1 className="text-2xl font-bold">Редагування колекції</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6 bg-white p-8 rounded-xl border border-gray-100 h-fit">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Обкладинка колекції</label>
                        <div className="flex items-start gap-6">
                            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 relative">
                                {formData.image ? (
                                    <Image src={formData.image} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-2xl">📷</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors inline-block mb-3">
                                    {uploading ? 'Завантаження...' : 'Змінити фото'}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                                <p className="text-xs text-gray-500">
                                    Рекомендований розмір: 1200x600px (або співвідношення 2:1).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                            <input
                                type="text"
                                name="slug"
                                required
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none font-mono text-sm bg-gray-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 h-fit">
                    <h2 className="font-bold mb-4">Товари в колекції</h2>
                    <input
                        type="text"
                        placeholder="Пошук товарів..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-black"
                    />

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {filteredProducts.map(product => {
                            const isSelected = formData.products.includes(product.id);
                            // Parse image for preview
                            let imageSrc = '';
                            try {
                                const images = JSON.parse(product.images);
                                if (images.length) imageSrc = images[0];
                            } catch (e) { }

                            return (
                                <label key={product.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-gray-50 border border-black/10' : 'hover:bg-gray-50 border border-transparent'}`}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleProductToggle(product.id)}
                                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                    />
                                    {imageSrc && (
                                        <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                                            <Image src={imageSrc} alt="" fill className="object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.price} ₴</p>
                                    </div>
                                </label>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">Товарів не знайдено</p>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center text-sm mb-4">
                            <span className="text-gray-500">Обрано:</span>
                            <span className="font-bold">{formData.products.length}</span>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-black text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Збереження...' : 'Зберегти зміни'}
                        </button>
                    </div>
                </div>

                {/* Bulk Color Update Section (Variant Builder) */}
                <div className="lg:col-span-3 bg-white p-8 rounded-xl border border-gray-100">
                    <h2 className="text-xl font-bold mb-2">Масове керування кольорами (Варіанти)</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Створіть набір варіантів кольорів та застосуйте їх до ВСІХ товарів колекції.<br />
                        <span className="text-red-500 font-medium">Увага: Це видалить старі кольори товарів і замінить їх на цей новий набір.</span>
                    </p>

                    <div className="space-y-4 mb-8">
                        {bulkVariants.map((variant, vIndex) => (
                            <div key={vIndex} className="p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium text-sm">Варіант {vIndex + 1}: {variant.name || '(Без назви)'}</h3>
                                    <button
                                        type="button"
                                        onClick={() => removeBulkVariant(vIndex)}
                                        className="text-red-500 text-xs hover:text-red-700 font-medium"
                                    >
                                        Видалити варіант
                                    </button>
                                </div>

                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Оберіть 1 або 2 кольори для цього варіанту:</label>
                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                    {availableColors.map(color => {
                                        const isSelected = variant.images.includes(color.image);
                                        return (
                                            <div
                                                key={color.id}
                                                onClick={() => toggleColorInVariant(vIndex, color)}
                                                className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-black ring-2 ring-black/10' : 'border-transparent hover:border-gray-300'}`}
                                                title={color.name}
                                            >
                                                <Image src={color.image} alt={color.name} fill className="object-cover" sizes="100px" />
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                        <div className="bg-black text-white rounded-full p-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Preview of Split (if 2 selected) */}
                                {variant.images.length === 2 && (
                                    <div className="mt-4 flex gap-4 items-center">
                                        <div className="relative w-12 h-12 border border-gray-200 rounded-lg overflow-hidden shrink-0">
                                            <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', zIndex: 1 }}>
                                                <Image src={variant.images[0]} alt="" fill className="object-cover" />
                                            </div>
                                            <div className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}>
                                                <Image src={variant.images[1]} alt="" fill className="object-cover" />
                                            </div>
                                            <div className="absolute inset-0 border-[1.5px] border-white/40" style={{
                                                background: 'linear-gradient(to bottom right, transparent 48%, white 48%, white 52%, transparent 52%)',
                                                opacity: 0.5
                                            }} />
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Автоматична назва: <span className="font-medium text-black">{variant.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addBulkVariant}
                        className="mb-8 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                        <span className="text-lg">+</span> Додати новий варіант кольору
                    </button>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleBulkColorUpdate}
                            disabled={bulkUpdating || bulkVariants.length === 0}
                            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50"
                        >
                            {bulkUpdating ? 'Застосування...' : `Застосувати ці ${bulkVariants.length} варіант(ів) до всієї колекції`}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
