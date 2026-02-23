export interface ProductMinimal {
    id: string;
    name: string;
    images: string;
    series?: string | null;
}

// Remove all non-alphanumeric chars and lowercase
// Remove all non-alphanumeric chars and lowercase, and normalize homoglyphs
export const normalizeProductString = (s: string) => {
    let str = s.toLowerCase();

    // Replace Latin homoglyphs with Cyrillic
    const homoglyphs: Record<string, string> = {
        'a': 'а', 'c': 'с', 'e': 'е', 'i': 'і', 'o': 'о', 'p': 'р', 'x': 'х', 'y': 'у',
        'h': 'н', 'k': 'к', 'b': 'в', 'm': 'м', 't': 'т'
    };

    str = str.replace(/[aceiopxyhkbmt]/g, m => homoglyphs[m]);

    return str.replace(/[^a-zа-я0-9]/g, '');
};

// Check if a color name matches a product name (handling translations)
export const isColorMatching = (productName: string, colorName: string) => {
    const normalize = normalizeProductString;
    const target = normalize(colorName);
    const sNameObj = normalize(productName);

    // 1. Try simple inclusion
    if (sNameObj.includes(target)) return true;

    // 2. Token matching with translation support
    const translations: Record<string, string> = {
        'белый': 'білий', 'білий': 'белый',
        'темный': 'темний', 'темний': 'темный',
        'светлый': 'світлий', 'світлий': 'светлый',
        'орех': 'горіх', 'горіх': 'орех',
        'дуб': 'дуб',
        'сонома': 'сонома',
        'венге': 'венге',
        'антрацит': 'антрацит',
        'сірий': 'серый', 'серый': 'сірий',
        'альба': 'альба',
        'трюфель': 'трюфель',
        'клондайк': 'клондайк',
        'крафт': 'крафт',
        'золотой': 'золотий', 'золотий': 'золотой',
        'зеленый': 'зелений', 'зелений': 'зеленый',
        'кашемір': 'кашемир', 'кашемир': 'кашемір',
        'бетон': 'бетон',
        'графіт': 'графит', 'графит': 'графіт',
    };

    const tokens = colorName.toLowerCase().split(/[\s\-\+]+/);

    // Check if every token matches (either direct or translated)
    return tokens.every(t => {
        const normT = normalize(t);
        if (!normT) return true; // skip empty tokens

        // Direct match check
        if (sNameObj.includes(normT)) return true;

        // Translation check
        const translated = translations[t] || translations[normT];
        if (translated && sNameObj.includes(normalize(translated))) return true;

        return false;
    });
};

export const findMatchingSibling = (siblings: ProductMinimal[], colorName: string) => {
    if (!siblings || !siblings.length) return null;
    return siblings.find(s => isColorMatching(s.name, colorName));
};
