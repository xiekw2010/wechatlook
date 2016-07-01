/**
 * Created by xiekaiwei on 16/6/23.
 */

"use strict";

const Crawler = require('simplecrawler');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const redis = require('./storage/redis');

const TEMP_HOT_PATH = 'http://www.wxcha.com/biaoqing/hot_';
const TEMP_RECENT_PATH = 'http://www.wxcha.com/biaoqing/update_';

function crawl() {
  crawlWXCHA(TEMP_HOT_PATH, 5, path.join(__dirname, '/test/fixtures/wx_hot_mocks.json'));
  crawlWXCHA(TEMP_RECENT_PATH, 5, path.join(__dirname, '/test/fixtures/wx_recent_mocks.json'));
}

function crawlWXCHA(base, range, outputs) {
  let WXCHA_CRAWLEDURLS = new Set();

  function crawledURLS(base, range) {
    const end = range;
    let arr = [];
    for (var i = 1; i < end; i++) {
      arr.push(i);
    }

    return arr.map(p => base + p + '.html');
  }

  function condition(parsedURL, queueItem) {
    return parsedURL.path.match(/^\/biaoqing\/\d+.html$/i)
  }

  function crawler(url, condition) {
    return new Promise((resolve, reject) => {
      const crawler = Crawler.crawl(url);
      crawler.maxDepth = 2;

      let result = [];
      crawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
        console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
        console.log("It was a resource of type %s", response.headers['content-type']);

        let ctn = this.wait();
        discoveryHotLinks(queueItem.url, responseBuffer, function(res) {
          result = result.concat(res);
          ctn();
        });
      });

      crawler.on('complete', () => resolve(result));

      crawler.addFetchCondition(condition);
      crawler.start();
    })
  }

  function discoveryHotLinks(url, data, fn) {
    let res = [];
    if (WXCHA_CRAWLEDURLS.has(url)) {
      fn && fn(res);
      return;
    }
    WXCHA_CRAWLEDURLS.add(url);

    const titleClass = 'div.h1_tit';
    const desc = 'div.daoyubox';
    const tupian = 'ul.tupian3_ul';

    const $ = cheerio.load(data.toString('utf8'));
    const title = $(titleClass).find('h1').text();
    if (title) {
      const descText = $(desc).find('p').text();
      const pics = $(tupian).children().find('img').get().map(p => p.attribs['data-original']);
      res.push({
        title: title,
        desc: descText,
        pics: pics,
        fromURL: url
      })
    }

    fn && fn(res);
  }

  const hotURLs = crawledURLS(base, range);

  const allCrawlHots = hotURLs.map(p => crawler(p, condition));
  Promise.all(allCrawlHots)
    .then(res => {
      console.log('crawl done');
      const result = res.reduce((a, b) => a.concat(b));
      fs.writeFileSync(outputs, JSON.stringify(result));
    })
    .catch(err => console.log('load hot failed', err))
}

module.exports = {
  crawl: crawl
};