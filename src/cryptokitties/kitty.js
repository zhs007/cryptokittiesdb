"use strict";

const { CrawlerMgr, CRAWLER, DATAANALYSIS, HeadlessChromeMgr } = require('crawlercore');
const cheerio = require('cheerio');
const util = require('util');
const { DBMgr } = require('../dbmgr');

const OPTIONS_TYPENAME = 'cryptokitties_kitty';

function analysisAttrib(crawler, element) {

    cheerio('a', element).each((index, aele) => {
        let arr0 = cheerio(aele).attr('class').split('--');
        let atttype = arr0[1];

        let arr1 = cheerio(aele).attr('href').split('=');
        let attval = arr1[1].replace('%3', ':');

        DBMgr.singleton.addAttrib(atttype, attval, false);
    });
}

// 分析数据
async function func_analysis(crawler) {
    const { Page, Runtime, Debugger, Network } = crawler.client;

    await Promise.all([
        Page.enable(),
        Debugger.enable(),
        Network.enable()
    ]);

    Page.frameAttached((params) => {
        console.log("on window", params);
    });

    await Page.navigate({url: crawler.options.uri});

    await Page.loadEventFired();
    const result1 = await Runtime.evaluate({
        expression: 'document.documentElement.outerHTML'
    });

    let obj = cheerio.load(result1.result.value);

    obj('.ListAttributes').each((index, ele) => {
        if (index == 0) {
            analysisAttrib(crawler, ele);
        }
    });

    HeadlessChromeMgr.singleton.closeTab(crawler.client);

    return crawler;
}

let kittyOptions = {
    typename: OPTIONS_TYPENAME,
    // 主地址
    uri: 'https://www.cryptokitties.co/kitty/1',
    timeout: 30 * 1000,

    // 爬虫类型
    crawler_type: CRAWLER.HEADLESSCHROME,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.NULL,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined,

    headlesschromename: '',

    kittyid: 1
};

async function startKittyCrawler(hcname, kittyid, callback) {
    let op = Object.assign({}, kittyOptions);

    op.headlesschromename = hcname;
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