"use strict";

const { Task } = require('jarvis-task');
const async = require('async');
const { CrawlerMgr, parseXML, addChildNodeXML, toXMLString } = require('crawlercore');
const { TaskFactory_CK } = require('../taskfactory');
const { TASK_NAMEID_RANDOMIMG } = require('../taskdef');
const { DBMgr } = require('../dbmgr');
const fs = require('fs');

class TaskRandomImg extends Task {
    constructor(cfg) {
        super(TASK_NAMEID_RANDOMIMG);

        this.cfg = cfg;
    }

    onStart() {
        super.onStart();

        DBMgr.singleton.init(this.cfg.maindb);

        DBMgr.singleton.loadImgAttr().then(() => {
            let lst = [];

            for (let idname in DBMgr.singleton.mapImg) {
                let maplst = DBMgr.singleton.mapImg[idname];
                let bodylst = [];
                for (let hk in maplst) {
                    bodylst.push(maplst[hk]);
                }

                let cr = Math.floor(Math.random() * bodylst.length);
                lst.push(bodylst[cr]);
            }

            let svgobj = {
                _name: 'svg',
                _attr: {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: '0 0 3000 3000',
                    'xmlns:xlink': 'http://www.w3.org/1999/xlink'
                },
                _lstchild: [],
                _parentnode: null
            }

            for (let ii = 0; ii < lst.length; ++ii) {
                let cx = parseXML(lst[ii].info);
                svgobj = addChildNodeXML(svgobj, cx);
            }

            fs.writeFileSync('./a.svg', toXMLString(svgobj));
        });
    }
};

TaskFactory_CK.singleton.regTask(TASK_NAMEID_RANDOMIMG, (cfg) => {
    return new TaskRandomImg(cfg);
});

exports.TaskRandomImg = TaskRandomImg;