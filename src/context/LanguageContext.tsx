'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionaries, Language } from '@/lib/dictionaries';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('UA');

    // Ignore localStorage and force UA always since user wants Ukrainian only
    useEffect(() => {
        setLanguageState('UA');
    }, []);

    const setLanguage = (lang: Language) => {
        // Do nothing, we are locked to UA
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let value = dictionaries[language];

        for (const k of keys) {
            value = value?.[k];
            if (!value) break;
        }

        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
