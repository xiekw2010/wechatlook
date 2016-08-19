/**
 * Created by xiekaiwei on 16/6/24.
 */
"use strict"

const monk = require('monk')
const config = require('../config/config')

const url = config.mongo
console.log('mongo url is', url)
const db = monk(url)

const looks = db.get('looks')
const lookTag = {
  hot: 'HOT',
  recent: 'RECENT'
}

module.exports = {
  looks,
  lookTag
}