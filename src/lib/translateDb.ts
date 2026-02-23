export function getLocalizedField(item: any, fieldName: string, language: string): string {
    if (!item) return '';

    // If language is UA (default), return base field
    if (language === 'UA' || !language) {
        return item[fieldName] || '';
    }

    // Convert e.g., 'EN' to 'En'
    const suffix = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
    const localizedFieldName = `${fieldName}${suffix}`;

    // Return the translated field if it exists and is not empty, otherwise fallback to the base field
    if (item[localizedFieldName] && typeof item[localizedFieldName] === 'string' && item[localizedFieldName].trim() !== '') {
        return item[localizedFieldName];
    }

    return item[fieldName] || '';
}
