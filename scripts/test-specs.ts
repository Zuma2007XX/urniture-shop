import * as cheerio from 'cheerio';

async function getSearchAction() {
    const res = await fetch('https://everestmebli.com.ua/');
    const html = await res.text();
    const $ = cheerio.load(html);

    const form = $('form[action*="search"]');
    console.log('Search form action:', form.attr('action'));
    console.log('Search form inputs:', form.find('input').map((_, el) => $(el).attr('name')).get());
}

getSearchAction().catch(console.error);
