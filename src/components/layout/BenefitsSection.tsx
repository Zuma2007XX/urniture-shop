'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function BenefitsSection() {
    const { t } = useLanguage();

    const benefits = [
        {
            number: '01/',
            title: t('benefits.items.0.title'),
            description: t('benefits.items.0.description'),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
            )
        },
        {
            number: '02/',
            title: t('benefits.items.1.title'),
            description: t('benefits.items.1.description'),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                </svg>
            )
        },
        {
            number: '03/',
            title: t('benefits.items.2.title'),
            description: t('benefits.items.2.description'),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.124-.504 1.125-1.125V15m-3 0V10.5M3.75 22.5h.008v.008H3.75v-.008Zm0 0c0 .621.504 1.125 1.125 1.125h.375m-1.5-1.5H.75" />
                </svg>
            )
        },
        {
            number: '04/',
            title: t('benefits.items.3.title'),
            description: t('benefits.items.3.description'),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
            )
        }
    ];

    return (
        <section className="mb-24 py-12 border-t border-gray-100">
            <div className="mb-12">
                <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">{t('benefits.subtitle')}</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight">
                    {t('benefits.title_prefix')} <span className="font-bold">SERIOUS MEBEL</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 border-b border-gray-100 lg:border-none">
                {benefits.map((item, idx) => (
                    <div key={idx} className="py-8 lg:py-0 lg:px-8 first:pl-0 last:pr-0 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6 text-gray-200">
                            <span className="text-xs font-medium">{item.number}</span>
                            <div className="p-3 rounded-full border border-gray-100 text-gray-400">
                                {item.icon}
                            </div>
                        </div>
                        <h3 className="text-lg font-medium mb-3 text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
