'use strict';

const koa = require('koa');
const logger = require('koa-logger');
const onerror = require('koa-onerror');
const routes = require('./routes');
const crawler = require('./crawler');
require('./storage/redis');

const app = koa();

// middlewares
app.use(logger());
onerror(app);
routes(app);
// listen
app.listen(3000);
console.log('listening on port 3000');

crawler.crawl();
setInterval(crawler.crawl, 12 * 60 * 60 * 1000);
