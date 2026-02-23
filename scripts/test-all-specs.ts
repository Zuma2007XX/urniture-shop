import * as cheerio from 'cheerio';

async function main() {
    const url = "https://everestmebli.com.ua/product/vidkritiy-penal-everest-sonata-400h376h2050-mm-venge-temniy";
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    console.log("All characteristics found:");
    $('p.font-17.mb-1').each((_, el) => {
        const title = $(el).find('span.ubuntu-medium').text().trim().replace(':', '');
        $(el).find('span.ubuntu-medium').remove();
        const value = $(el).text().trim();
        if (title && value) {
            console.log(`- ${title}: ${value}`);
        }
    });

    console.log("\nTables:");
    $('table.table-striped tbody tr').each((_, el) => {
        const tds = $(el).find('td');
        if (tds.length >= 6) {
            const weight = $(tds[2]).text().trim();
            const width = $(tds[3]).text().trim();
            const height = $(tds[4]).text().trim();
            const depth = $(tds[5]).text().trim();
            console.log(`- Package: W=${width}, H=${height}, D=${depth}, Weight=${weight}`);
        }
    });
}
main().catch(console.error);
