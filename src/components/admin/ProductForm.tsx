'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProductFormProps {
    initialData?: {
        id: string;
        name: string;
        sku: string | null;
        description: string;
        price: number;
        images: string;
        category: string;
        stock: number;
        series: string | null;
        badge: string | null;
        material: string | null;
        frame: string | null;
        upholstery: string | null;
        loadLimit: string | null;
        assembly: string | null;
        recyclability: string | null;
        warranty: string | null;
        concept: string | null;
        collectionId: string | null;
        specifications: string | null;
    };
}

import { PRODUCT_CATEGORIES } from '@/lib/constants';

const categories = PRODUCT_CATEGORIES;

interface ProductFormData {
    name: string;
    sku: string;
    description: string;
    price: string;
    images: string[];
    category: string;
    stock: string;
    series: string;
    badge: string;
    material: string;
    frame: string;
    upholstery: string;
    loadLimit: string;
    assembly: string;
    recyclability: string;
    warranty: string;
    concept: string;
    collectionId: string;
    specifications: {
        general: {
            roomUse: string;
            location: string;
            drawerGuides: string;
            drawerCount: string;
        };
        materials: {
            frameEdge: string;
            frameMaterial: string;
            facadeMaterial: string;
            facadeEdge: string;
        };
        frame: {
            shelfCount: string;
        };
        warranty: {
            period: string;
            production: string;
        };
        colors: {
            name: string;
            images: string[];
        }[];
    };
}

export default function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingColor, setUploadingColor] = useState(false);

    const [form, setForm] = useState(() => {
        const defaultSpecs = {
            general: { roomUse: '', location: '', drawerGuides: '', drawerCount: '' },
            materials: { frameEdge: '', frameMaterial: '', facadeMaterial: '', facadeEdge: '' },
            frame: { shelfCount: '' },
            warranty: { period: '', production: '' },
            colors: [] as { name: string; images: string[] }[],
        };

        let parsedSpecs = defaultSpecs;
        if (initialData?.specifications) {
            try {
                const parsed = JSON.parse(initialData.specifications);
                // Deep merge or ensure keys exist
                parsedSpecs = {
                    ...defaultSpecs,
                    ...parsed,
                    general: { ...defaultSpecs.general, ...(parsed.general || {}) },
                    materials: { ...defaultSpecs.materials, ...(parsed.materials || {}) },
                    frame: { ...defaultSpecs.frame, ...(parsed.frame || {}) },
                    warranty: { ...defaultSpecs.warranty, ...(parsed.warranty || {}) },
                    colors: Array.isArray(parsed.colors) ? parsed.colors : defaultSpecs.colors
                };
            } catch (e) {
                // fallback to default
            }
        }

        return {
            name: initialData?.name || '',
            sku: initialData?.sku || '',
            description: initialData?.description || '',
            price: initialData?.price?.toString() || '',
            category: initialData?.category || 'chairs',
            stock: initialData?.stock?.toString() || '0',
            series: initialData?.series || '',
            badge: initialData?.badge || '',
            material: initialData?.material || '',
            frame: initialData?.frame || '',
            upholstery: initialData?.upholstery || '',
            loadLimit: initialData?.loadLimit || '',
            assembly: initialData?.assembly || '',
            recyclability: initialData?.recyclability || '',
            warranty: initialData?.warranty || '',
            concept: initialData?.concept || '',
            collectionId: initialData?.collectionId || '',
            specifications: parsedSpecs,
        };
    });

    const [availableColors, setAvailableColors] = useState<{ id: string; name: string; image: string }[]>([]);

    useEffect(() => {
        let mounted = true;
        fetch('/api/admin/colors')
            .then(res => res.json())
            .then(data => {
                if (mounted && Array.isArray(data)) setAvailableColors(data);
            })
            .catch(console.error);
        return () => { mounted = false; };
    }, []);

    // Ensure colors array exists if parsing existing data (double check)
    if (!form.specifications.colors) {
        // This is now likely redundant due to init logic but safeguards renders
        // We can't mutate state directly here in render, but updating the ref reference or handling in init is better.
        // Actually, let's remove this side-effect from render and trust the init logic.
    }

    const [collections, setCollections] = useState<{ id: string; title: string }[]>([]);

    useEffect(() => {
        let mounted = true;
        fetch('/api/admin/collections')
            .then(res => res.json())
            .then(data => {
                if (mounted && Array.isArray(data)) setCollections(data);
            })
            .catch(console.error);

        return () => { mounted = false; };
    }, []);

    const [images, setImages] = useState<string[]>(() => {
        try {
            return JSON.parse(initialData?.images || '[]');
        } catch {
            return [];
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('specifications.')) {
            const parts = name.split('.'); // specifications.general.roomUse
            const section = parts[1];
            const field = parts[2];

            setForm(prev => ({
                ...prev,
                specifications: {
                    ...prev.specifications,
                    [section]: {
                        ...prev.specifications[section as keyof typeof prev.specifications],
                        [field]: value
                    }
                }
            }));
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);
        const newImages = [...images];

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                newImages.push(data.url);
            }
        }

        setImages(newImages);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // Color Management
    const handleAddColor = () => {
        setForm(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                colors: [...(prev.specifications.colors || []), { name: '', images: [] as string[] }]
            }
        }));
    };

    const handleRemoveColor = (index: number) => {
        setForm(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                colors: prev.specifications.colors.filter((_, i) => i !== index)
            }
        }));
    };

    const handleColorNameChange = (index: number, value: string) => {
        setForm(prev => {
            const newColors = [...prev.specifications.colors];
            newColors[index] = { ...newColors[index], name: value };
            return {
                ...prev,
                specifications: {
                    ...prev.specifications,
                    colors: newColors
                }
            };
        });
    };

    const handleToggleColor = (variantIndex: number, colorImage: string, colorName: string) => {
        setForm(prev => {
            const newColors = [...prev.specifications.colors];
            const currentVariant = newColors[variantIndex];
            const currentImages = currentVariant.images || [];

            let newImages: string[];
            if (currentImages.includes(colorImage)) {
                newImages = currentImages.filter(img => img !== colorImage);
            } else {
                if (currentImages.length >= 2) return prev; // Max 2 colors
                newImages = [...currentImages, colorImage];
            }

            // Auto-generate name
            const selectedColorNames = newImages.map(img => {
                const found = availableColors.find(c => c.image === img);
                return found ? found.name : '';
            }).filter(Boolean);

            const newName = selectedColorNames.join(' + ');

            newColors[variantIndex] = {
                ...currentVariant,
                images: newImages,
                name: newName
            };

            return {
                ...prev,
                specifications: {
                    ...prev.specifications,
                    colors: newColors
                }
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            ...form,
            images: JSON.stringify(images),
        };

        const url = initialData
            ? `/api/admin/products/${initialData.id}`
            : '/api/admin/products';

        const method = initialData ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            router.push('/admin/products');
        } else {
            const data = await res.json();
            alert(data.error || 'Помилка збереження');
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl">
            <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-semibold mb-6">Основна інформація</h2>

                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Назва *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Артикул (SKU)</label>
                        <input
                            name="sku"
                            value={form.sku}
                            onChange={handleChange}
                            placeholder="Наприклад: 11222"
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Ціна (₴) *</label>
                        <input
                            name="price"
                            type="number"
                            value={form.price}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Категорія *</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors bg-white"
                        >
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Кількість на складі</label>
                        <input
                            name="stock"
                            type="number"
                            value={form.stock}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Бейдж</label>
                        <input
                            name="badge"
                            value={form.badge}
                            onChange={handleChange}
                            placeholder="NEW, SALE..."
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Серія</label>
                        <input
                            name="series"
                            value={form.series}
                            onChange={handleChange}
                            placeholder="Серія 01"
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Матеріал</label>
                        <input
                            name="material"
                            value={form.material}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Опис</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Концепція</label>
                        <textarea
                            name="concept"
                            value={form.concept}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Detailed Specifications */}
            <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-semibold mb-6">Детальні характеристики</h2>

                <div className="space-y-8">
                    {/* General */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 border-b border-gray-100 pb-2">Загальні</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Кімната використання</label>
                                <input
                                    name="specifications.general.roomUse"
                                    value={form.specifications.general.roomUse}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    placeholder="Спальня, вітальня, дитяча, офіс"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Розташування</label>
                                <input
                                    name="specifications.general.location"
                                    value={form.specifications.general.location}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    placeholder="Напольне"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Тип направляючих ящиків</label>
                                <input
                                    name="specifications.general.drawerGuides"
                                    value={form.specifications.general.drawerGuides}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    placeholder="Телескопічні"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Кількість ящиків</label>
                                <input
                                    name="specifications.general.drawerCount"
                                    value={form.specifications.general.drawerCount}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    placeholder="4"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Materials */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 border-b border-gray-100 pb-2">Матеріали</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Матеріал кромки каркасу</label>
                                <input
                                    name="specifications.materials.frameEdge"
                                    value={form.specifications.materials.frameEdge}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    placeholder="ПВХ"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Матеріал каркасу</label>
                                <input
                                    name="specifications.materials.frameMaterial"
                                    value={form.specifications.materials.frameMaterial}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    placeholder="ЛДСП"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Матеріал фасаду</label>
                                <input
                                    name="specifications.materials.facadeMaterial"
                                    value={form.specifications.materials.facadeMaterial}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    placeholder="ЛДСП"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Матеріал кромки фасаду</label>
                                <input
                                    name="specifications.materials.facadeEdge"
                                    value={form.specifications.materials.facadeEdge}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    placeholder="ПВХ"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Frame */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 border-b border-gray-100 pb-2">Каркас</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Кількість полиць</label>
                                <input
                                    name="specifications.frame.shelfCount"
                                    value={form.specifications.frame.shelfCount}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    placeholder="2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Warranty */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 border-b border-gray-100 pb-2">Гарантія</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Гарантійний термін</label>
                                <input
                                    name="specifications.warranty.period"
                                    value={form.specifications.warranty.period}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    placeholder="12 місяців"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Виробництво</label>
                                <input
                                    name="specifications.warranty.production"
                                    value={form.specifications.warranty.production}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                    placeholder="Україна"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Colors */}
                    <div>
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Варіанти (Кольори)</h3>
                            <button
                                type="button"
                                onClick={handleAddColor}
                                className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                            >
                                + Додати варіант
                            </button>
                        </div>

                        <div className="space-y-6">
                            {form.specifications.colors && form.specifications.colors.map((variant, index) => (
                                <div key={index} className="p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 mr-4">
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Назва варіанту</label>
                                            <input
                                                value={variant.name}
                                                onChange={(e) => handleColorNameChange(index, e.target.value)}
                                                placeholder="Автоматично генерується або власний текст"
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveColor(index)}
                                            className="text-red-500 hover:text-red-700 transition-colors mt-6"
                                        >
                                            Видалити
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Оберіть кольори і текстури (макс 2)</label>
                                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                            {availableColors.map((color) => {
                                                const isSelected = variant.images?.includes(color.image);
                                                return (
                                                    <div
                                                        key={color.id}
                                                        onClick={() => handleToggleColor(index, color.image, color.name)}
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
                                        {availableColors.length === 0 && (
                                            <div className="text-sm text-gray-400 py-2">
                                                Немає доступних кольорів. Додайте їх у розділі "Кольори".
                                            </div>
                                        )}
                                    </div>

                                    {/* Preview of Split (if 2 selected) */}
                                    {variant.images && variant.images.length === 2 && (
                                        <div className="mt-4">
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Попередній перегляд (Змішування)</label>
                                            <div className="relative w-16 h-16 border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', zIndex: 1 }}>
                                                    <Image src={variant.images[0]} alt="" fill className="object-cover" />
                                                </div>
                                                <div className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}>
                                                    <Image src={variant.images[1]} alt="" fill className="object-cover" />
                                                </div>
                                                <div className="absolute inset-0 border-[1.5px] border-white" style={{
                                                    background: 'linear-gradient(to bottom right, transparent 48%, white 48%, white 52%, transparent 52%)',
                                                    opacity: 0.5
                                                }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {(!form.specifications.colors || form.specifications.colors.length === 0) && (
                                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                                    Немає доданих варіантів
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-semibold mb-6">Фотографії</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {images.map((img, i) => (
                        <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                            <Image src={img} alt="" fill className="object-cover" sizes="200px" />
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {/* Upload button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {uploading ? (
                            <div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full" />
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <span className="text-[11px] uppercase tracking-wider">Додати фото</span>
                            </>
                        )}
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    className="hidden"
                />

                {/* URL input for external images */}
                <div className="mt-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="Або вставте URL зображення..."
                        id="imageUrl"
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                    setImages([...images, input.value.trim()]);
                                    input.value = '';
                                }
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            const input = document.getElementById('imageUrl') as HTMLInputElement;
                            if (input.value.trim()) {
                                setImages([...images, input.value.trim()]);
                                input.value = '';
                            }
                        }}
                        className="px-4 py-2.5 bg-gray-100 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Додати
                    </button>
                </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-black text-white text-sm font-bold uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Збереження...' : initialData ? 'Зберегти зміни' : 'Створити товар'}
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/admin/products')}
                    className="text-sm text-gray-500 hover:text-black transition-colors"
                >
                    Скасувати
                </button>
            </div>
        </form>
    );
}
