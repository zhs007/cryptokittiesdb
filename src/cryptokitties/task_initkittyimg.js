"use strict";

const { Task } = require('jarvis-task');
const async = require('async');
const { CrawlerMgr } = require('crawlercore');
const { TaskFactory_CK } = require('../taskfactory');
const { TASK_NAMEID_INITKITTYIMG } = require('../taskdef');
const { DBMgr } = require('../dbmgr');
const { startKittyImgCrawler } = require('./img');

class TaskInitKittyImg extends Task {
    constructor(cfg) {
        super(TASK_NAMEID_INITKITTYIMG);

        this.cfg = cfg;
    }

    onStart() {
        super.onStart();

        DBMgr.singleton.init(this.cfg.maindb);

        DBMgr.singleton.loadAttrib().then(() => {

            let arr = [];
            for (let ii = 30000; ii <= 33000; ++ii) {
                arr.push(ii);
            }

            async.eachSeries(arr, (val, next) => {
                startKittyImgCrawler(this.cfg.headlesschrome_name, val, async (crawler) => {}).then(() => {
                    next();
                });
            }, (err) => {
                CrawlerMgr.singleton.start(true, false, async () => {
                    // await DBMgr.singleton.saveAttrib();

                    this.onEnd();
                }, true);
            });
        });
    }
};

TaskFactory_CK.singleton.regTask(TASK_NAMEID_INITKITTYIMG, (cfg) => {
    return new TaskInitKittyImg(cfg);
});

exports.TaskInitKittyImg = TaskInitKittyImg;