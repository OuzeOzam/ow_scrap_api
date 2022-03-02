const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

require('dotenv').config();

const middlewares = require('./middlewares');
const owhero = require('./heroesScrap');
const heroesNames = require('./heroesNames');

const app = express();

let cacheTime;
let heroes;

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/over', async (req, res) => {
  if (cacheTime && cacheTime > Date.now() - (1000 * 1000)) {
    return res.json(heroes);
  }
  //by Alex : .slice pour réduire le nombre de requetes
  // heroes = await owhero((await heroesNames()).slice(1,3));
  // heroes = await owhero([{url: "https://overwatch.fandom.com/wiki/Zarya", name : "Zarya"}]);
  heroes = await owhero(await heroesNames());
  cacheTime = Date.now();
  res.json(heroes);
  console.log(heroes);
});

// filters
// heroName_filter
app.get('/over/:heroName', async (req, res) => {

  if (!heroes) {
    heroes = await owhero(await heroesNames());
  }
  let filter = heroes.filter(d => d.name === req.params.heroName);
  if (!filter.length) {
    res.json('Not Found');
    return;
  }
  cacheTime = Date.now();
  res.json(filter[0]);
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);


module.exports = app;
