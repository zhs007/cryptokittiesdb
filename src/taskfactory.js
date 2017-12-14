"use strict";

const { TaskFactory, regTaskFactory_InitCrawlerMgr } = require('jarvis-task');
const { TASKFACTORY_NAMEID_CRYPTOKITTIES } = require('./taskdef');

class TaskFactory_CK extends TaskFactory {
    constructor() {
        super(TASKFACTORY_NAMEID_CRYPTOKITTIES);

        regTaskFactory_InitCrawlerMgr(this);
    }
};

TaskFactory_CK.singleton = new TaskFactory_CK();

exports.TaskFactory_CK = TaskFactory_CK;
