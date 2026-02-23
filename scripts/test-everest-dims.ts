import * as cheerio from 'cheerio';

async function main() {
    const url = "https://everestmebli.com.ua/product/vidkritiy-penal-everest-sonata-400h376h2050-mm-venge-temniy";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    let weight = 0;
    let width = 0;
    let height = 0;
    let depth = 0;

    // The packaging table has columns:
    // # | Назва | Вага (кг) | Ширина (мм) | Висота (мм) | Глибина (мм)
    $('table.table-striped tbody tr').each((_, el) => {
        const tds = $(el).find('td');
        if (tds.length >= 6) {
            weight += parseFloat($(tds[2]).text().trim()) || 0;

            // For width, height, depth, we might just take the max or sum depending on if it's pieces.
            // Usually furniture has it in the title or characteristics...
            const w = parseFloat($(tds[3]).text().trim()) || 0;
            const h = parseFloat($(tds[4]).text().trim()) || 0;
            const d = parseFloat($(tds[5]).text().trim()) || 0;

            // Just printing to see
            console.log(`Package: Weight ${weight}, W/H/D = ${w} / ${h} / ${d}`);
        }
    });

    // Let's also parse the product title to extract actual assembled dimensions:
    // e.g. "Відкритий пенал Everest Соната 400х376х2050 мм венге темний"
    const title = $('h1').text().trim();
    console.log("Title:", title);

    // Sometimes it's like 400x376x2050 or 400х376х2050 (cyrillic x)
    const dimMatch = title.match(/(\d+)\s*[xх]\s*(\d+)\s*[xх]\s*(\d+)/i);
    if (dimMatch) {
        console.log(`Dimensions from title: W=${dimMatch[1]}, D=${dimMatch[2]}, H=${dimMatch[3]} (assuming WxDxH or WxHxD)`);
    }
}

main().catch(console.error);
