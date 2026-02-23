'use client';

import { useLanguage } from '@/context/LanguageContext';

interface TranslatedTextProps {
    dictKey: string;
    defaultText?: string;
    className?: string;
}

export default function TranslatedText({ dictKey, defaultText, className }: TranslatedTextProps) {
    const { t } = useLanguage();

    // t() will return the key if not found, or the defaultText if provided as fallback logic in t (which we don't have yet)
    // Our t logic: returns value || key.
    // So if we want defaultText to be the fallback if key is missing/matches key:

    const translated = t(dictKey);
    const result = translated === dictKey && defaultText ? defaultText : translated;

    return <span className={className}>{result}</span>;
}
