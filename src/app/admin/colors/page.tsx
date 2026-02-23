'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Color {
    id: string;
    name: string;
    image: string;
}

export default function ColorsPage() {
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newColorName, setNewColorName] = useState('');
    const [newColorImage, setNewColorImage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchColors();
    }, []);

    const fetchColors = async () => {
        try {
            const res = await fetch('/api/admin/colors');
            const data = await res.json();
            if (Array.isArray(data)) {
                setColors(data);
            }
        } catch (error) {
            console.error('Error fetching colors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                setNewColorImage(data.url);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Помилка завантаження');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddColor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newColorName || !newColorImage) return;

        try {
            const res = await fetch('/api/admin/colors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newColorName, image: newColorImage }),
            });

            if (res.ok) {
                setNewColorName('');
                setNewColorImage('');
                fetchColors();
            } else {
                alert('Помилка створення кольору');
            }
        } catch (error) {
            console.error('Error creating color:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Видалити цей колір?')) return;

        try {
            const res = await fetch(`/api/admin/colors/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setColors(colors.filter(c => c.id !== id));
            } else {
                alert('Помилка видалення');
            }
        } catch (error) {
            console.error('Error deleting color:', error);
        }
    };

    return (
        <div className="max-w-5xl">
            <h1 className="text-2xl font-bold mb-8">Бібліотека кольорів та текстур</h1>

            {/* Add New Color Form */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Додати новий колір</h2>
                <form onSubmit={handleAddColor} className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Image Upload */}
                    <div className="flex-shrink-0">
                        <div
                            className="relative w-24 h-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:border-black transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {newColorImage ? (
                                <Image src={newColorImage} alt="Preview" fill className="object-cover" />
                            ) : (
                                <div className="text-center p-2">
                                    {uploading ? (
                                        <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mx-auto" />
                                    ) : (
                                        <>
                                            <span className="block text-2xl mb-1">+</span>
                                            <span className="text-[10px] uppercase text-gray-400">Фото</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Name Input */}
                    <div className="flex-1 w-full">
                        <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Назва</label>
                        <input
                            value={newColorName}
                            onChange={(e) => setNewColorName(e.target.value)}
                            placeholder="Наприклад: Дуб сонома"
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!newColorName || !newColorImage}
                        className="mt-6 md:mt-0 bg-black text-white text-sm font-bold uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[46px]"
                    >
                        Додати
                    </button>
                </form>
            </div>

            {/* Colors Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {colors.map((color) => (
                    <div key={color.id} className="group relative bg-white border border-gray-100 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-gray-100">
                            <Image src={color.image} alt={color.name} fill className="object-cover" />
                        </div>
                        <p className="text-sm font-medium truncate" title={color.name}>{color.name}</p>

                        <button
                            onClick={() => handleDelete(color.id)}
                            className="absolute top-2 right-2 w-6 h-6 bg-white/90 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto" />
                </div>
            )}

            {!loading && colors.length === 0 && (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                    Бібліотека кольорів порожня
                </div>
            )}
        </div>
    );
}
