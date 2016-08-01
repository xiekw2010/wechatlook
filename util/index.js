/**
 * Created by xiekaiwei on 16/6/24.
 */
"use strict";

const dateformat = require('dateformat');
const DATEFORMATTER = 'yyyy-mm-dd HH:MM:ss';

function now() {
  return dateformat(new Date(), DATEFORMATTER)
}

module.exports = {
  now,
};