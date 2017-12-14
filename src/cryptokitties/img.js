"use strict";

const { CrawlerMgr, CRAWLER, DATAANALYSIS, HeadlessChromeMgr } = require('crawlercore');
const cheerio = require('cheerio');
const util = require('util');
const { DBMgr } = require('../dbmgr');

const OPTIONS_TYPENAME = 'cryptokitties_kittyimg';

// 分析数据
async function func_analysis(crawler) {

    return crawler;
}

let kittyImgOptions = {
    typename: OPTIONS_TYPENAME,
    // 主地址
    uri: 'https://storage.googleapis.com/ck-kitty-image/0x06012c8cf97bead5deae237070f9587f8e7a266d/30.svg',
    timeout: 5 * 60 * 1000,

    // 爬虫类型
    crawler_type: CRAWLER.REQUEST,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.XML,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined,

    headlesschromename: '',

    kittyid: 1
};

async function startKittyImgCrawler(kittyid, callback) {
    let op = Object.assign({}, kittyImgOptions);

    op.kittyid = kittyid;
    op.uri = util.format('https://storage.googleapis.com/ck-kitty-image/0x06012c8cf97bead5deae237070f9587f8e7a266d/%d.svg', kittyid);

    op.func_onfinish = callback;

    await CrawlerMgr.singleton.addCrawler(op);
}

exports.kittyImgOptions = kittyImgOptions;
exports.startKittyImgCrawler = startKittyImgCrawler;

CrawlerMgr.singleton.regOptions(OPTIONS_TYPENAME, () => {
    let options = Object.assign({}, kittyImgOptions);
    return options;
});