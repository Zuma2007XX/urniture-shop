'use client';

import { useEffect, useState } from 'react';

interface ContactField {
    section: string;
    label: string;
    fields: {
        key: 'title' | 'subtitle' | 'body' | 'linkText' | 'linkUrl';
        label: string;
        placeholder: string;
        multiline?: boolean;
        helpText?: string;
    }[];
}

const CONTACT_SECTIONS: ContactField[] = [
    {
        section: 'contact_phone',
        label: '📞 Телефон',
        fields: [
            { key: 'title', label: 'Номер телефону', placeholder: '+38 (050) 123-45-67' },
            { key: 'subtitle', label: 'Години роботи', placeholder: 'Пн-Пт: 9:00–18:00' },
        ],
    },
    {
        section: 'contact_email',
        label: '✉️ Email',
        fields: [
            { key: 'title', label: 'Email адреса', placeholder: 'info@seriousmebel.ua' },
            { key: 'subtitle', label: 'Примітка', placeholder: 'Відповідаємо протягом 24 годин' },
        ],
    },
    {
        section: 'contact_address',
        label: '📍 Адреса',
        fields: [
            { key: 'title', label: 'Місто', placeholder: 'м. Запоріжжя' },
            { key: 'subtitle', label: 'Вулиця', placeholder: 'вул. Промислова, 42' },
        ],
    },
    {
        section: 'contact_hours',
        label: '🕐 Графік роботи',
        fields: [
            {
                key: 'body',
                label: 'Розклад',
                placeholder: 'Пн-Пт: 9:00–18:00|Субота: 10:00–15:00|Неділя: Вихідний',
                multiline: true,
                helpText: 'Формат: День: Час, розділяйте рядки символом |',
            },
        ],
    },
    {
        section: 'contact_departments',
        label: '🏢 Відділи',
        fields: [
            {
                key: 'body',
                label: 'Список відділів',
                placeholder: 'Відділ продажів|+38 (050) 123-45-67||Сервіс|+38 (050) 765-43-21',
                multiline: true,
                helpText: 'Формат: Назва|Контакт, розділяйте відділи подвійним ||',
            },
        ],
    },
    {
        section: 'contact_social',
        label: '🌐 Соціальні мережі',
        fields: [
            { key: 'linkText', label: 'Instagram URL', placeholder: 'https://instagram.com/yourpage' },
            { key: 'linkUrl', label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
            { key: 'body', label: 'Telegram URL', placeholder: 'https://t.me/yourchannel' },
        ],
    },
];

interface SectionData {
    [key: string]: string;
}

export default function AdminContactsPage() {
    const [data, setData] = useState<Record<string, SectionData>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/content')
            .then(r => r.json())
            .then((contents: any[]) => {
                const map: Record<string, SectionData> = {};
                contents.forEach(c => {
                    if (c.section.startsWith('contact_')) {
                        map[c.section] = {
                            title: c.title || '',
                            subtitle: c.subtitle || '',
                            body: c.body || '',
                            linkText: c.linkText || '',
                            linkUrl: c.linkUrl || '',
                        };
                    }
                });
                // Ensure all sections exist
                CONTACT_SECTIONS.forEach(s => {
                    if (!map[s.section]) {
                        map[s.section] = { title: '', subtitle: '', body: '', linkText: '', linkUrl: '' };
                    }
                });
                setData(map);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const updateField = (section: string, key: string, value: string) => {
        setData(prev => ({
            ...prev,
            [section]: { ...prev[section], [key]: value },
        }));
    };

    const handleSave = async (section: string) => {
        setSaving(section);
        const sectionData = data[section];
        await fetch('/api/admin/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                section,
                title: sectionData.title || null,
                subtitle: sectionData.subtitle || null,
                body: sectionData.body || null,
                linkText: sectionData.linkText || null,
                linkUrl: sectionData.linkUrl || null,
                image: null,
            }),
        });
        setSaving(null);
        setSaved(section);
        setTimeout(() => setSaved(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Контакти</h1>
                <p className="text-sm text-gray-500 mt-1">Редагуйте контактну інформацію на сторінці «Контакти»</p>
            </div>

            <div className="space-y-6">
                {CONTACT_SECTIONS.map(sec => (
                    <div key={sec.section} className="bg-white rounded-xl border border-gray-100 p-8">
                        <h2 className="text-base font-semibold mb-6">{sec.label}</h2>

                        <div className="space-y-5">
                            {sec.fields.map(field => (
                                <div key={field.key}>
                                    <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">
                                        {field.label}
                                    </label>
                                    {field.multiline ? (
                                        <textarea
                                            value={data[sec.section]?.[field.key] || ''}
                                            onChange={e => updateField(sec.section, field.key, e.target.value)}
                                            rows={3}
                                            placeholder={field.placeholder}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={data[sec.section]?.[field.key] || ''}
                                            onChange={e => updateField(sec.section, field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                                        />
                                    )}
                                    {field.helpText && (
                                        <p className="text-[11px] text-gray-400 mt-1">{field.helpText}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <button
                                onClick={() => handleSave(sec.section)}
                                disabled={saving === sec.section}
                                className={`text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 ${saved === sec.section
                                    ? 'bg-green-600 text-white'
                                    : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                            >
                                {saving === sec.section ? 'Збереження...' : saved === sec.section ? '✓ Збережено' : 'Зберегти'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
