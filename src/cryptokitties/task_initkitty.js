"use strict";

const { Task } = require('jarvis-task');
const async = require('async');
const { CrawlerMgr } = require('crawlercore');
const { TaskFactory_CK } = require('../taskfactory');
const { TASK_NAMEID_INITKITTY } = require('../taskdef');
const { DBMgr } = require('../dbmgr');
const { startKittyCrawler } = require('./kitty');

class TaskInitKitty extends Task {
    constructor(cfg) {
        super(TASK_NAMEID_INITKITTY);

        this.cfg = cfg;
    }

    onStart() {
        super.onStart();

        DBMgr.singleton.init(this.cfg.maindb);

        DBMgr.singleton.loadAttrib().then(() => {

            let arr = [];
            for (let ii = 1; ii < 10000; ++ii) {
                arr.push(ii);
            }

            async.eachSeries(arr, (val, next) => {
                startKittyCrawler(val, async (crawler) => {}).then(() => {
                    next();
                });
            }, (err) => {
                CrawlerMgr.singleton.start(true, false, async () => {
                    await DBMgr.singleton.saveAttrib();

                    this.onEnd();
                }, true);
            });
        });
    }
};

TaskFactory_CK.singleton.addTask(TASK_NAMEID_INITKITTY, (cfg) => {
    return new TaskInitKitty(cfg);
});

exports.TaskInitKitty = TaskInitKitty;