"use strict";

const util = require('util');
const { CrawlerMgr } = require('crawlercore');

const SQL_BATCH_NUMS = 2048;

class DBMgr {
    constructor() {
        this.mapAttribType = {};
        this.mapImg = {};

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

        if (!this.mapAttribType[atttype].hasOwnProperty(attval)) {
            this.mapAttribType[atttype][attval] = indb;
        }
    }

    // async hasImgAttr(hashkey, idname) {
    //     let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);
    //
    //     let str = util.format("select * from imgattr where hashkey = '%s' and idname = '%s'", hashkey, idname);
    //     let [rows, fields] = await conn.query(str);
    //     if (rows.length > 0) {
    //         return true;
    //     }
    //
    //     return false;
    // }

    async insImgAttr(hashkey, idname, info) {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        // await conn.beginTransaction();
        let str = util.format("select * from imgattr where hashkey = '%s' and idname = '%s'", hashkey, idname);
        let [rows, fields] = await conn.query(str);
        if (rows.length > 0) {
            return ;
        }

        let sql = util.format("insert into imgattr(hashkey, info, idname) values('%s', '%s', '%s')", hashkey, info, idname);
        try{
            await conn.query(sql);
        }
        catch(err) {
            console.log('mysql err: ' + err);
            console.log('mysql sql: ' + sql);
        }

        // await conn.commit();
    }

    async loadImgAttr() {
        this.mapImg = {};

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let str = util.format("select * from imgattr");
        let [rows, fields] = await conn.query(str);
        for (let i = 0; i < rows.length; ++i) {
            this.addImgAttr(rows[i].hashkey, rows[i].info, rows[i].idname, true);
        }
    }

    addImgAttr(hashkey, info, idname, indb) {
        if (!this.mapImg.hasOwnProperty(idname)) {
            this.mapImg[idname] = {};
        }

        if (this.mapImg[idname].hasOwnProperty(hashkey)) {
            return false;
        }

        this.mapImg[idname][hashkey] = {
            idname: idname,
            haskkey: hashkey,
            info: info,
            indb: indb
        };

        return true;
    }

};

DBMgr.singleton = new DBMgr();

exports.DBMgr = DBMgr;