'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SiteContent {
    id: string;
    section: string;
    title: string | null;
    subtitle: string | null;
    body: string | null;
    image: string | null;
    linkText: string | null;
    linkUrl: string | null;
}

interface Product {
    id: string;
    name: string;
    price: number;
    images: string;
    category: string;
}

const sectionLabels: Record<string, string> = {
    hero: '🖼 Hero-банер (головна сторінка)',
    featured_title: '⭐ Секція "Хіти продажу"',
    new_arrivals_title: '✨ Секція "Новинки"',
    collections_title: '📁 Секція "Колекції"',
    collection_1: '📁 Колекція 1',
    collection_2: '📁 Колекція 2',
    collection_3: '📁 Колекція 3',
};

export default function AdminContent() {
    const [contents, setContents] = useState<SiteContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [uploading, setUploading] = useState<string | null>(null);

    // Featured & New Arrivals products state
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [featuredIds, setFeaturedIds] = useState<string[]>([]);
    const [savingFeatured, setSavingFeatured] = useState(false);
    const [newArrivalsIds, setNewArrivalsIds] = useState<string[]>([]);
    const [savingNewArrivals, setSavingNewArrivals] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/content').then(r => r.json()),
            fetch('/api/admin/products').then(r => r.json()),
            fetch('/api/admin/products/featured').then(r => r.json()).catch(() => []),
            fetch('/api/admin/products/new-arrivals').then(r => r.json()).catch(() => []),
        ]).then(([contentData, productsData, featuredData, newArrivalsData]) => {
            setContents(contentData);
            setAllProducts(Array.isArray(productsData) ? productsData : []);
            setFeaturedIds(Array.isArray(featuredData) ? featuredData : []);
            setNewArrivalsIds(Array.isArray(newArrivalsData) ? newArrivalsData : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const updateField = (section: string, field: string, value: string) => {
        setContents(contents.map(c =>
            c.section === section ? { ...c, [field]: value } : c
        ));
    };

    const handleSave = async (content: SiteContent) => {
        setSaving(content.section);
        await fetch('/api/admin/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content),
        });
        setSaving(null);
    };

    const handleImageUpload = async (section: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(section);
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.url) {
            updateField(section, 'image', data.url);
        }
        setUploading(null);
    };

    const handleRemoveImage = (section: string) => {
        updateField(section, 'image', '');
    };

    const toggleFeatured = (productId: string) => {
        setFeaturedIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSaveFeatured = async () => {
        setSavingFeatured(true);
        await fetch('/api/admin/products/featured', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: featuredIds }),
        });
        setSavingFeatured(false);
    };

    const toggleNewArrivals = (productId: string) => {
        setNewArrivalsIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSaveNewArrivals = async () => {
        setSavingNewArrivals(true);
        await fetch('/api/admin/products/new-arrivals', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: newArrivalsIds }),
        });
        setSavingNewArrivals(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Контент сайту</h1>
                <p className="text-sm text-gray-500 mt-1">Редагуйте тексти та зображення на сайті</p>
            </div>

            <div className="space-y-6">
                {contents.map(content => (
                    <div key={content.id} className="bg-white rounded-xl border border-gray-100 p-8">
                        <h2 className="text-base font-semibold mb-6">
                            {sectionLabels[content.section] || content.section}
                        </h2>

                        <div className="space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Заголовок</label>
                                <input
                                    type="text"
                                    value={content.title || ''}
                                    onChange={(e) => updateField(content.section, 'title', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Підзаголовок</label>
                                <textarea
                                    value={content.subtitle || ''}
                                    onChange={(e) => updateField(content.section, 'subtitle', e.target.value)}
                                    rows={2}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none mb-4"
                                />

                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Опис (Body)</label>
                                <textarea
                                    value={content.body || ''}
                                    onChange={(e) => updateField(content.section, 'body', e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                                />
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Зображення</label>
                                {content.image ? (
                                    <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3 group">
                                        <Image src={content.image} alt="" fill className="object-cover" sizes="400px" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(content.section)}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : null}
                                <div className="flex gap-2">
                                    <label className="cursor-pointer px-4 py-2.5 bg-gray-100 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                                        {uploading === content.section ? 'Завантаження...' : '📷 Завантажити'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(content.section, e)}
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        value={content.image || ''}
                                        onChange={(e) => updateField(content.section, 'image', e.target.value)}
                                        placeholder="або URL зображення"
                                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Link */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Текст посилання</label>
                                    <input
                                        type="text"
                                        value={content.linkText || ''}
                                        onChange={(e) => updateField(content.section, 'linkText', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">URL посилання</label>
                                    <input
                                        type="text"
                                        value={content.linkUrl || ''}
                                        onChange={(e) => updateField(content.section, 'linkUrl', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <button
                                onClick={() => handleSave(content)}
                                disabled={saving === content.section}
                                className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                {saving === content.section ? 'Збереження...' : 'Зберегти'}
                            </button>
                        </div>

                        {/* Featured Products Picker - only for featured_title section */}
                        {content.section === 'featured_title' && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-semibold mb-4">🛍 Оберіть товари для &quot;Хіти продажу&quot;</h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Обрано: {featuredIds.length} товар(ів). Натисніть на товар щоб додати/видалити.
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                                    {allProducts.map(product => {
                                        const isFeatured = featuredIds.includes(product.id);
                                        const images = JSON.parse(product.images || '[]');
                                        return (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => toggleFeatured(product.id)}
                                                className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${isFeatured
                                                    ? 'border-black bg-gray-50'
                                                    : 'border-gray-100 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                                    {images[0] && (
                                                        <Image
                                                            src={images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="48px"
                                                        />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium truncate">{product.name}</p>
                                                    <p className="text-[11px] text-gray-500">{product.price.toLocaleString('uk-UA')} ₴</p>
                                                </div>
                                                {isFeatured && (
                                                    <span className="text-green-600 text-sm shrink-0">✓</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={handleSaveFeatured}
                                        disabled={savingFeatured}
                                        className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        {savingFeatured ? 'Збереження...' : '💾 Зберегти хіти продажу'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* New Arrivals Products Picker - only for new_arrivals_title section */}
                        {content.section === 'new_arrivals_title' && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-semibold mb-4">✨ Оберіть товари для &quot;Новинки&quot;</h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Обрано: {newArrivalsIds.length} товар(ів). Натисніть на товар щоб додати/видалити.
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                                    {allProducts.map(product => {
                                        const isNewArrival = newArrivalsIds.includes(product.id);
                                        const images = JSON.parse(product.images || '[]');
                                        return (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => toggleNewArrivals(product.id)}
                                                className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${isNewArrival
                                                    ? 'border-black bg-gray-50'
                                                    : 'border-gray-100 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                                    {images[0] && (
                                                        <Image
                                                            src={images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="48px"
                                                        />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium truncate">{product.name}</p>
                                                    <p className="text-[11px] text-gray-500">{product.price.toLocaleString('uk-UA')} ₴</p>
                                                </div>
                                                {isNewArrival && (
                                                    <span className="text-green-600 text-sm shrink-0">✓</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={handleSaveNewArrivals}
                                        disabled={savingNewArrivals}
                                        className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        {savingNewArrivals ? 'Збереження...' : '💾 Зберегти новинки'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
