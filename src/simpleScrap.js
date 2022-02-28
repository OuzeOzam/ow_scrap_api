const puppeteer = require('puppeteer');

const heroNames = [
  'Mercy',
  'Baptiste',
  'Soldier76'
];

async function owhero() {

  for (let heroName of heroNames) {

    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    // await page.goto('https://overwatch.fandom.com/wiki/Baptiste');
    await page.goto(`https://overwatch.fandom.com/wiki/${heroName}`);
    await page.waitForSelector('#mw-content-text', {
      visible: true
    })
    const heroes = await page.evaluate(() => {
      let element = document.querySelector('#mw-content-text');
      let heroes = {
        name: element.querySelector('th').textContent.trim(),
        img: element.querySelector('.infoboxtable img').src,
      };
      return heroes;
    });
    await browser.close();
    return heroes;
  }
}



module.exports = owhero;