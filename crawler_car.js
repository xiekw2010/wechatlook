/**
 * Created by xiekaiwei on 16/6/23.
 */

"use strict";

const Crawler = require('simplecrawler');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const redis = require('./storage/redis');
const request = require('request');

const TEMP_HOT_PATH = 'http://www.pcauto.com.cn/zt/chebiao/';
const ALL_BRANDS = [
  'guochan',
  'deguo',
]

function crawl() {
  crawlWXCHA(TEMP_HOT_PATH, path.join(__dirname, '/test/fixtures/wx_hot_mocks.json'));
}

function crawlWXCHA(base, outputs) {
  let WXCHA_CRAWLEDURLS = new Set();

  function crawledURLS(base) {
    return ALL_BRANDS.map(p => base + p);
  }

  function condition(parsedURL, queueItem) {
    return parsedURL.path.match(/^\/zt\/chebiao\/\w+\/$/i)
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

    const imageClass = 'ul.expPicA';
    const $ = cheerio.load(data.toString('utf8'));
    const images = $(imageClass).find('img').get().map(o => o.attribs.src);
    if (images) {
      console.log('images is', images);
      res = images;
    }

    fn && fn(res);
  }

  const hotURLs = crawledURLS(base);

  const allCrawlHots = hotURLs.map(p => crawler(p, condition));
  Promise.all(allCrawlHots)
    .then(res => {
      console.log('crawl done');
      const result = res.reduce((a, b) => a.concat(b));
      console.log('result is', result);
      const downLoadImages = result.map(ig => downloadImage(ig));
      return Promise.all(downLoadImages);
    })
    .catch(err => console.log('load hot failed', err))
}

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function downloadImage(uri) {
  new Promise((resolve, reject) => {
    const fileName = path.basename(uri);
    const toPath = path.join(__dirname, 'cunImages/' + fileName);
    download(uri, toPath, function(){
      resolve('ok');
    });
  })
}

module.exports = {
  crawl: crawl
};