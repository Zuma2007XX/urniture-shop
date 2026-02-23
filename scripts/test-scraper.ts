async function extractInfo() {
    const res = await fetch('https://everestmebli.com.ua/product/komod-everest-sonata-1-800x376x739-mm-dub-kraft-biliy');
    const text = await res.text();

    console.log('--- Searching for SKU ---');
    const skuMatch = text.match(/Артикул.*?>([^<]+)</i);
    if (skuMatch) console.log('SKU:', skuMatch[1].trim());

    console.log('--- Searching for Images ---');
    // Common paths in Laravel / Magento / generic shops
    const imgMatches = text.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi);
    if (imgMatches) {
        const unique = [...new Set(imgMatches)].filter(url =>
            !url.includes('/icons/') &&
            !url.includes('logo') &&
            !url.includes('/vendor/')
        );
        console.log(unique);
    }
}
extractInfo();
