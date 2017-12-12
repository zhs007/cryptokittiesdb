"use strict";

const { Task } = require('jarvis-task');
const { CrawlerMgr, HeadlessChromeMgr } = require('crawlercore');
const { TaskFactory_CK } = require('./taskfactory');
const { TASK_NAMEID_INIT } = require('./taskdef');

const HEADLESSCHROME_NAME = 'hc';
const HEADLESSCHROME_OPTION = {
    port: 9222,
    autoSelectChrome: true,
    additionalFlags: ['--window-size=1136,640', '--disable-gpu', '--headless']
};

class TaskInit extends Task {
    constructor(cfg) {
        super(TASK_NAMEID_INIT);

        this.cfg = cfg;
    }

    onStart() {
        super.onStart();

        HeadlessChromeMgr.singleton.addHeadlessChrome(HEADLESSCHROME_NAME, HEADLESSCHROME_OPTION);

        for (let dbcfgname in this.cfg.mysqlcfg) {
            CrawlerMgr.singleton.addMysqlCfg(dbcfgname, this.cfg.mysqlcfg[dbcfgname]);
        }

        for (let crawlerkey in this.cfg.crawlercfg) {
            CrawlerMgr.singleton[crawlerkey] = this.cfg.crawlercfg[crawlerkey];
        }

        CrawlerMgr.singleton.init().then(() => {
            HeadlessChromeMgr.singleton.getHeadlessChrome(HEADLESSCHROME_NAME).then(() => {
                this.onEnd();
            });
        });
    }
};

TaskFactory_CK.singleton.addTask(TASK_NAMEID_INIT, (cfg) => {
    return new TaskInit(cfg);
});

exports.TaskInit = TaskInit;