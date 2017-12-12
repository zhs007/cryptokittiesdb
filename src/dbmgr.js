"use strict";

const util = require('util');
const { CrawlerMgr } = require('crawlercore');

const SQL_BATCH_NUMS = 2048;

class DBMgr {
    constructor() {
        this.mapAttribType = {};

        this.mysqlid = undefined;
    }

    init(mysqlid) {
        this.mysqlid = mysqlid;
    }

    async loadAttrib() {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let str = util.format("select * from cattributes");
        let [rows, fields] = await conn.query(str);
        for (let i = 0; i < rows.length; ++i) {
            this.addAttrib(rows[i].atttype, rows[i].attval, true);
        }
    }

    async saveAttrib() {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        for (let atttype in this.mapAttribType) {
            let maptype = this.mapAttribType[atttype];
            for (let attval in maptype) {
                if (!maptype[attval]) {
                    let sql = util.format("insert into cattributes(atttype, attval) values('%s', '%s');",
                        atttype, attval);

                    try{
                        await conn.query(sql);
                    }
                    catch(err) {
                        console.log('mysql err: ' + err);
                        console.log('mysql sql: ' + sql);
                    }
                }
            }
        }
    }

    addAttrib(atttype, attval, indb) {
        if (!this.mapAttribType.hasOwnProperty(atttype)) {
            this.mapAttribType[atttype] = {};
        }

        this.mapAttribType[atttype][attval] = indb;
    }
};

DBMgr.singleton = new DBMgr();

exports.DBMgr = DBMgr;