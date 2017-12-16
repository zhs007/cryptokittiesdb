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

    makeImg() {
        let lst = [];
        // let bodyhash = undefined;
        // let tailhash = undefined;

        for (let idname in DBMgr.singleton.mapImg) {
            if (idname == 'body' || idname == 'tail') {
                continue;
            }

            let curlst = DBMgr.singleton.mapImgList[idname];
            let cr = Math.floor(Math.random() * curlst.length);
            lst.push(curlst[cr]);

            if (idname == 'bodyFur') {
                let ch = curlst[cr].hashkey;
                let lstbody = DBMgr.singleton.mapBody[ch];
                if (lstbody != undefined && lstbody.length > 0) {
                    let cbr = Math.floor(Math.random() * lstbody.length);
                    lst.push(DBMgr.singleton.mapImg['body'][lstbody[cbr]]);
                }
            }
            else if (idname == 'tailFur') {
                let ch = curlst[cr].hashkey;
                let lsttail = DBMgr.singleton.mapTail[ch];
                if (lsttail != undefined && lsttail.length > 0) {
                    let ctr = Math.floor(Math.random() * lsttail.length);
                    lst.push(DBMgr.singleton.mapImg['tail'][lsttail[ctr]]);
                }
            }

            // let maplst = DBMgr.singleton.mapImg[idname];
            // let bodylst = [];
            // for (let hk in maplst) {
            //     bodylst.push(maplst[hk]);
            // }
            //
            // let cr = Math.floor(Math.random() * bodylst.length);
            // lst.push(bodylst[cr]);
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
        };

        for (let ii = 0; ii < lst.length; ++ii) {
            let cx = parseXML(lst[ii].info);
            svgobj = addChildNodeXML(svgobj, cx);

            // fs.writeFileSync('./a' + lst[ii].idname + '.svg', toXMLString(svgobj));
        }

        return svgobj;
    }

    onStart() {
        super.onStart();

        DBMgr.singleton.init(this.cfg.maindb);

        DBMgr.singleton.loadImgAttr().then(() => {
            DBMgr.singleton.loadBodyImg().then(() => {
               DBMgr.singleton.loadTailImg().then(() => {
                   DBMgr.singleton.rebuildImgList();

                   for (let ii = 0; ii < 100; ++ii) {
                       let svgobj = this.makeImg();
                       fs.writeFileSync('./b' + ii + '.svg', toXMLString(svgobj));
                   }
               });
            });

            // let lst = [];
            //
            // for (let idname in DBMgr.singleton.mapImg) {
            //     let maplst = DBMgr.singleton.mapImg[idname];
            //     let bodylst = [];
            //     for (let hk in maplst) {
            //         bodylst.push(maplst[hk]);
            //     }
            //
            //     let cr = Math.floor(Math.random() * bodylst.length);
            //     lst.push(bodylst[cr]);
            // }
            //
            // for (let ii = 0; ii < lst.length; ++ii) {
            //     let svgobj = {
            //         _name: 'svg',
            //         _attr: {
            //             xmlns: 'http://www.w3.org/2000/svg',
            //             viewBox: '0 0 3000 3000',
            //             'xmlns:xlink': 'http://www.w3.org/1999/xlink'
            //         },
            //         _lstchild: [],
            //         _parentnode: null
            //     };
            //
            //     let cx = parseXML(lst[ii].info);
            //     svgobj = addChildNodeXML(svgobj, cx);
            //
            //     fs.writeFileSync('./a' + lst[ii].idname + '.svg', toXMLString(svgobj));
            // }
        });
    }
};

TaskFactory_CK.singleton.regTask(TASK_NAMEID_RANDOMIMG, (cfg) => {
    return new TaskRandomImg(cfg);
});

exports.TaskRandomImg = TaskRandomImg;