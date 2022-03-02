const {
    Cluster
} = require('puppeteer-cluster');

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

    await cluster.task(async ({
        page,
        data: url
    }) => {
        page.setDefaultNavigationTimeout(0);
        await page.goto(url);
        await page.waitForSelector('#mw-content-text', {
            visible: true,
        });
        const hero = await page.evaluate(() => {
            let element = document.querySelector('#mw-content-text');
            let others = document.querySelectorAll('.ability_details_main');
            let thirds = document.querySelectorAll('div.ability_box > div:nth-child(3) > div:nth-child(1)');
            console.log(others);
            
            return {
                name: element.querySelector('th').textContent.trim(),
                img: element.querySelector('.infoboxtable img').src,
                abilities: Array.prototype.map.call(others, other => {
                    return {
                        name: other.querySelector('div.ability_box > div.abilityHeader').firstChild.data,
                        img: other.querySelector('div.summaryInfoAndImage > div:nth-child(1) > div.abilityImage > div:nth-child(2) > div > div > img').dataset.src,
                        abilitiesDetails: Array.prototype.map.call(thirds, third => {
                            let title = third.querySelector('div:nth-child(1) > b');
                            let data = third.querySelector('div:nth-child(2)');
                            return {
                                title: title ? title.textContent : "Undefine",
                                description: document.querySelector('div:nth-child(1) > b > span').title,
                                data: data ? data.textContent : "Undefine",
                            }
                        })
                    }
                }),
            }
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