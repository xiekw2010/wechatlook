/**
 * Created by xiekaiwei on 16/6/23.
 */

"use strict"

const Crawler = require('simplecrawler')
const cheerio = require('cheerio')
const fs = require('fs')
const storage = require('./storage/mongo')
const scope = storage.lookTag
const util = require('./util')

const TEMP_HOT_PATH = 'http://www.wxcha.com/biaoqing/hot_'
const TEMP_RECENT_PATH = 'http://www.wxcha.com/biaoqing/update_'
const CRAWL_NUMS = 20

function crawl() {
  crawlWXCHA(TEMP_HOT_PATH, CRAWL_NUMS, scope.hot)
  crawlWXCHA(TEMP_RECENT_PATH, CRAWL_NUMS, scope.recent)
}

function crawlWXCHA(base, range, scope) {
  let WXCHA_CRAWLEDURLS = new Set()

  function crawledURLS(base, range) {
    const arr = Array.apply(null, { length: range }).map((v, i) => i)
    return arr.map(p => base + p + '.html')
  }

  function condition(parsedURL) {
    return parsedURL.path.match(/^\/biaoqing\/\d+.html$/i)
  }

  function crawler(url, condition) {
    return new Promise((resolve, reject) => {
      const crawler = Crawler.crawl(url)
      crawler.maxDepth = 2

      let result = []
      crawler.on("fetchcomplete", function (queueItem, responseBuffer, response) {
        console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length)
        console.log("It was a resource of type %s", response.headers['content-type'])

        let ctn = this.wait()
        discoveryHotLinks(queueItem.url, responseBuffer, function (res) {
          result = result.concat(res)
          ctn()
        })
      })

      crawler.on('complete', () => resolve(result))
      crawler.on('error', (err) => reject(err))
      crawler.addFetchCondition(condition)
      crawler.start()
    })
  }

  function discoveryHotLinks(url, data, fn) {
    let res = []
    if (WXCHA_CRAWLEDURLS.has(url)) {
      fn && fn(res)
      return
    }
    WXCHA_CRAWLEDURLS.add(url)

    const titleClass = 'div.h1_tit'
    const desc = 'div.daoyubox'
    const tupian = 'ul.tupian3_ul'

    const $ = cheerio.load(data.toString('utf8'))
    const title = $(titleClass).find('h1').text()
    if (title) {
      const descText = $(desc).find('p').text()
      const pics = $(tupian).children()
        .find('img')
        .get()
        .map(p => p.attribs['data-original'])
      res.push({
        title: title,
        desc: descText,
        pics: pics,
        fromURL: url,
        scope: scope,
        createAt: util.now(),
      })
    }

    fn && fn(res)
  }

  const allCrawlHots = crawledURLS(base, range)
    .map(p => crawler(p, condition))
  Promise.all(allCrawlHots)
    .then(res => res.reduce((a, b) => a.concat(b), []))
    .then(flatRes => {
      if (flatRes.length > 0) return storage.looks.insert(flatRes)
      return []
    })
    .then(insertRes => console.log('insert Res is', insertRes))
    .catch(err => console.log('crawler failed', err))
}

module.exports = {
  crawl: crawl
}