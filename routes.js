/*!
 * mojing - routes.js
 * Copyright(c) 2014 ju.taobao.com
 * Author: jianhui.fjh <jianhui.fjh@alibaba-inc.com>
 */

'use strict';

/**
 * Module dependencies.
 */
const route = require('koa-route');
const looks = require('./controllers/api/looks');

module.exports = function (app) {
  app.use(route.get('/api/allLooks', looks.allLooks));
};




