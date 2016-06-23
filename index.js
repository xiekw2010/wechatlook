'use strict';

const koa = require('koa');
const logger = require('koa-logger');
const onerror = require('koa-onerror');
const routes = require('./routes');

const app = koa();

// middlewares
app.use(logger());
onerror(app);
routes(app);

// listen
app.listen(3000);
console.log('listening on port 3000');
