'use client';

import { useState, useRef } from 'react';

export default function AdminSettings() {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [logoTimestamp, setLogoTimestamp] = useState(Date.now());
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        if (!file) return;

        const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            setMessage({ text: 'Невірний формат. Використовуйте PNG, JPG, WebP або SVG.', type: 'error' });
            return;
        }

        setUploading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/admin/logo', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: 'Логотип успішно оновлено!', type: 'success' });
                setLogoTimestamp(data.timestamp || Date.now());
            } else {
                setMessage({ text: data.error || 'Помилка завантаження', type: 'error' });
            }
        } catch {
            setMessage({ text: 'Помилка з\'єднання з сервером', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Налаштування</h1>

            <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-2xl">
                <h2 className="text-lg font-semibold mb-4">Логотип сайту</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Логотип відображається в шапці, підвалі та адмін-панелі сайту.
                </p>

                {/* Current Logo Preview */}
                <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                    <img
                        src={`/logo.png?v=${logoTimestamp}`}
                        alt="Поточний логотип"
                        className="max-h-20 object-contain"
                    />
                </div>

                {/* Upload Area */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
                        ${dragOver
                            ? 'border-black bg-gray-50'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }
                        ${uploading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-10 h-10 mx-auto mb-3 text-gray-400"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                        />
                    </svg>

                    {uploading ? (
                        <p className="text-sm text-gray-500">Завантаження...</p>
                    ) : (
                        <>
                            <p className="text-sm font-medium text-gray-700">
                                Натисніть або перетягніть файл сюди
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG, WebP або SVG
                            </p>
                        </>
                    )}
                </div>

                {/* Status Message */}
                {message && (
                    <div
                        className={`mt-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
