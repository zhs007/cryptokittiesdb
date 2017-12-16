"use strict";

const util = require('util');
const { CrawlerMgr } = require('crawlercore');

const SQL_BATCH_NUMS = 2048;

class DBMgr {
    constructor() {
        this.mapAttribType = {};
        this.mapImg = {};
        this.mapImgList = {};

        this.mysqlid = undefined;

        this.mapBody = {};
        this.mapTail = {};
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
            hashkey: hashkey,
            info: info,
            indb: indb
        };

        return true;
    }

    addBodyImg(bodyhash, bodyfurhash) {
        if (!this.mapBody.hasOwnProperty(bodyfurhash)) {
            this.mapBody[bodyfurhash] = [];
        }

        if (this.mapBody[bodyfurhash].indexOf(bodyhash) >= 0) {
            return false;
        }

        this.mapBody[bodyfurhash].push(bodyhash);

        return true;
    }

    async insBodyImg(bodyhash, bodyfurhash) {
        if (!this.addBodyImg(bodyhash, bodyfurhash)) {
            return ;
        }

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let sql = util.format("insert into bodyimg(bodyhash, bodyfurhash) values('%s', '%s')", bodyhash, bodyfurhash);
        try{
            await conn.query(sql);
        }
        catch(err) {
            console.log('mysql err: ' + err);
            console.log('mysql sql: ' + sql);
        }
    }

    async loadBodyImg() {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let sql = util.format("select * from bodyimg");
        try{
            let [rows, fields] = await conn.query(sql);
            for (let ii = 0; ii < rows.length; ++ii) {
                this.addBodyImg(rows[ii].bodyhash, rows[ii].bodyfurhash);
            }
        }
        catch(err) {
            console.log('mysql err: ' + err);
            console.log('mysql sql: ' + sql);
        }
    }

    addTailImg(tailhash, tailfurhash) {
        if (!this.mapTail.hasOwnProperty(tailfurhash)) {
            this.mapTail[tailfurhash] = [];
        }

        if (this.mapTail[tailfurhash].indexOf(tailhash) >= 0) {
            return false;
        }

        this.mapTail[tailfurhash].push(tailhash);

        return true;
    }

    async insTailImg(tailhash, tailfurhash) {
        if (!this.addTailImg(tailhash, tailfurhash)) {
            return ;
        }

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let sql = util.format("insert into tailimg(tailhash, tailfurhash) values('%s', '%s')", tailhash, tailfurhash);
        try{
            await conn.query(sql);
        }
        catch(err) {
            console.log('mysql err: ' + err);
            console.log('mysql sql: ' + sql);
        }
    }

    async loadTailImg() {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let sql = util.format("select * from tailimg");
        try{
            let [rows, fields] = await conn.query(sql);
            for (let ii = 0; ii < rows.length; ++ii) {
                this.addTailImg(rows[ii].tailhash, rows[ii].tailfurhash);
            }
        }
        catch(err) {
            console.log('mysql err: ' + err);
            console.log('mysql sql: ' + sql);
        }
    }

    rebuildImgList() {
        this.mapImgList = {};

        for (let idname in this.mapImg) {
            this.mapImgList[idname] = [];

            let maplst = this.mapImg[idname];
            for (let hk in maplst) {
                this.mapImgList[idname].push(maplst[hk]);
            }
        }
    }
};

DBMgr.singleton = new DBMgr();

exports.DBMgr = DBMgr;