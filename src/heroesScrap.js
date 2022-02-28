const { Cluster } = require('puppeteer-cluster');

async function owhero(heroesInformations) {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: heroesInformations.length,
        timeout: 99999,
        monitor: true,
        puppeteerOptions: {
            headless: true,
        },
    });

    cluster.on('taskerror', (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
    });
   
    const heroes = [];

    await cluster.task(async ({ page, data: url }) => {
        await page.setDefaultNavigationTimeout(0);
        await page.goto(url);
        await page.waitForSelector('#mw-content-text', {
            visible: true,
        });
        const hero = await page.evaluate(() => {
            let element = document.querySelector('#mw-content-text');
            return {
                description : {
                    name: element.querySelector('th').textContent.trim(),
                    img: element.querySelector('.infoboxtable img').src,
                },
                abilities : {
                    title: element.querySelectorAll('div.abilityHeader').textContent,
                }
            };
        });
        heroes.push(hero);
    });
    for (const heroesInformation of heroesInformations) {
        cluster.queue(heroesInformation.url);
    }

    await cluster.idle();
    await cluster.close();
    return heroes;
};

module.exports = owhero