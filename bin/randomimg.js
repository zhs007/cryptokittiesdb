"use strict";

const fs = require('fs');
const process = require('process');
const { startTaskChain } = require('jarvis-task');
const { TaskFactory_CK } = require('../src/taskfactory');
require('../src/alltask');

const cfg = JSON.parse(fs.readFileSync('./randomimg.json').toString());

startTaskChain(cfg, TaskFactory_CK.singleton, () => {

});