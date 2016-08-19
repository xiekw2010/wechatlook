/*!
 * mojing - controllers/task.js
 * Copyright(c) 2014 ju.taobao.com
 * Author: jianhui.fjh <jianhui.fjh@alibaba-inc.com>
 */
'use strict'

const storage = require('../../storage/mongo')
const url = require('url')
const LOOK_TAG = storage.lookTag
const DEFAULT_LIMIT = 50

exports.hotLooks = function* () {
  yield* findLooks(this, { scope: LOOK_TAG.hot })
}

exports.recentLooks = function* () {
  yield* findLooks(this, { scope: LOOK_TAG.recent })
}

exports.queryLooks = function* () {
  const { query } = this.request

  let predicate = {}
  if (query.desc) {
    predicate = { title: new RegExp(`.*${query.desc}.*`, 'i') }
  }

  yield* findLooks(this, predicate)
}

function handledQuery(q = {}) {
  const query = Object.assign({}, q)
  if (!query.pagination) query.pagination = 0
  if (!query.limit) query.limit = DEFAULT_LIMIT

  return query
}

function* findLooks(ctx, predicate = {}) {
  const excludeId = {
    fields: {
      _id: 0
    }
  }

  let res
  try {
    res = yield storage.looks.find(predicate, excludeId)
  } catch (err) {
    ctx.body = {
      code: 500,
      msg: err.message
    }
    ctx.throw(err.message, 500)
  }

  let query = handledQuery(ctx.request.query)
  let { pagination, limit } = query

  const nextRes = limit * (pagination + 1) < res.length

  res = res.splice(limit * pagination, limit)
  const body = {
    code: 200,
    msg: 'query success!',
    data: res
  }

  if (nextRes) {
    query.pagination = ++pagination
    query.limit = limit
    let href = ctx.href
    let searchLocation = href.indexOf('?')
    if (!~searchLocation) searchLocation = href.length
    href = href.slice(0, searchLocation)
    href += '?' + stringifyQuery(query)

    body.next = href
  }

  ctx.body = body
}

function stringifyQuery(q) {
  return Object
    .keys(q)
    .map(k => k + '=' + q[k])
    .reduce((a, b) => a + '&' + b, '')
    .slice(1)
}

