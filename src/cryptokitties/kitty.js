"use strict";

const { CrawlerMgr, CRAWLER, DATAANALYSIS } = require('crawlercore');
const cheerio = require('cheerio');
const util = require('util');
const DBMgr = require('../dbmgr');

const OPTIONS_TYPENAME = 'cryptokitties_kitty';

function analysisAttrib(crawler, element) {
    cheerio(element)('a').each((index, ele) => {
        let arr0 = element.attribs.a.split('--');
        let atttype = arr0[1];

        let arr1 = element.attribs.href.split('=');
        let attval = arr1[1];

        DBMgr.singleton.addAttrib(atttype, attval, false);
    });
}

// 分析数据
async function func_analysis(crawler) {
    crawler.da.data('.ListAttributes').each((index, ele) => {
        if (index == 0) {
            analysisAttrib(ele);
        }
    });

    return crawler;
}

let kittyOptions = {
    typename: OPTIONS_TYPENAME,
    // 主地址
    uri: 'https://www.cryptokitties.co/kitty/1',
    timeout: 30 * 1000,

    // 爬虫类型
    crawler_type: CRAWLER.REQUEST,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.CHEERIO,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined,

    kittyid: 1
};

async function startKittyCrawler(kittyid, callback) {
    let op = Object.assign({}, kittyOptions);

    op.kittyid = kittyid;
    op.uri = util.format('https://www.cryptokitties.co/kitty/%d', kittyid);

    op.func_onfinish = callback;

    await CrawlerMgr.singleton.addCrawler(op);
}

exports.kittyOptions = kittyOptions;
exports.startKittyCrawler = startKittyCrawler;

CrawlerMgr.singleton.regOptions(OPTIONS_TYPENAME, () => {
    let options = Object.assign({}, kittyOptions);
    return options;
});