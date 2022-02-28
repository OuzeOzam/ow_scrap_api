const puppeteer = require('puppeteer');
async function heroesNames() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://overwatch.fandom.com/wiki/Heroes');
    const heroes = await page.evaluate(() => {
        let heroesNames = [];
        let elements = document.querySelectorAll('.wikitable.sortable.jquery-tablesorter tbody tr td:nth-child(2) a:nth-child(2)');
        for (element of elements) {
            heroesNames.push({
                name: element.title,
                url: element.href,
            })
        }
        return heroesNames;
    });
    await browser.close();
    return heroes;
};

module.exports = heroesNames;
