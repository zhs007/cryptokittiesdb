"use strict";

const { Task } = require('jarvis-task');
const { CrawlerMgr } = require('crawlercore');
const { TaskFactory_CK } = require('./taskfactory');
const { TASK_NAMEID_INIT } = require('./taskdef');

class TaskInit extends Task {
    constructor(cfg) {
        super(TASK_NAMEID_INIT);

        this.cfg = cfg;
    }

    onStart() {
        super.onStart();

        for (let dbcfgname in this.cfg.mysqlcfg) {
            CrawlerMgr.singleton.addMysqlCfg(dbcfgname, this.cfg.mysqlcfg[dbcfgname]);
        }

        for (let crawlerkey in this.cfg.crawlercfg) {
            CrawlerMgr.singleton[crawlerkey] = this.cfg.crawlercfg[crawlerkey];
        }

        CrawlerMgr.singleton.init().then(() => {
            this.onEnd();
        });
    }
};

TaskFactory_CK.singleton.addTask(TASK_NAMEID_INIT, (cfg) => {
    return new TaskInit(cfg);
});

exports.TaskInit = TaskInit;