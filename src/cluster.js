const { Cluster } = require('puppeteer-cluster');

const urls = [
  'https://overwatch.fandom.com/wiki/Baptiste',
  'https://overwatch.fandom.com/wiki/Mercy',
];
(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 100,
    monitor: true,
    puppeteerOptions: {
      headless: true,
    },
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);
    await page.waitForSelector('#mw-content-text', {
      visible: true,
    });
    const heroes = await page.evaluate(() => {
      let element = document.querySelector('#mw-content-text');
      let heroes = {
        name: element.querySelector('th').textContent.trim(),
        img: element.querySelector('.infoboxtable img').src,
      };
      return heroes;
    });
    return heroes;
  });

  for (const url of urls) {
await cluster.queue(url);
  }

  // await cluster.idle();
  // await cluster.close();
})();
