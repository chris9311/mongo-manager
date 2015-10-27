/**
 * Created by HUANGCH4 on 2015/8/26.
 */
var express = require('express');
var async = require('async');
var router = express.Router();

router.get('/databases',function(req,res){

    var databases = req.databases;
    var databaselist = [];
    async.map(databases,function(db,callback2){
        db.collections(function(err,collections) {
            var _datbase = {};
            var collNames = [];
            async.map(collections,function(colls,callback){
                var coll = {
                    name : colls.s.name
                };
                collNames.push(coll);
                callback(null,null);
            },function(err,result){
                _datbase = {
                    name : db.s.databaseName,
                    collNames : collNames
                };
                databaselist.push(_datbase);
            });
            callback2(null,null);
        });

    },function(err,result){
        res.json({
            success:true,
            databases : databaselist
        });
    });
});

router.get('/getstats',function(req,res){
    var databases = req.databases;
    var dbsstats = [];
    async.map(databases,function(database,callback){
        database.stats(function(err,stats){
            if(err){
                res.json({
                    success : false,
                    err : err
                })
            }

            var dbstats = {
                db : stats.db,
                collections : stats.collections,
                objects : stats.objects,
                dataSize : stats.dataSize,
                storageSize : stats.storageSize,
                indexes : stats.indexes,
                dindexSizeb : stats.indexSize,
                fileSize : stats.fileSize,
                nsSizeMB : stats.nsSizeMB,
            };
            dbsstats.push(dbstats);
            callback(null,null);
        });
    },function(err,result){
        res.json({
            success : true,
            dbsstats : dbsstats
        })
    });
});

router.get('/getcollections/:dbName',function(req,res){

    var dbName = req.params.dbName;
    var db = req.databases[dbName];
    var collections = [];
    db.collections(function(err,colls){
        async.map(colls,function(coll,cb){

            coll.stats(function(err,stats){
                var collection = {
                    name : coll.s.name,
                    stats : {
                        ns : stats.ns,
                        size : stats.size,
                        count : stats.count,
                        totalIndex : stats.nindexes
                    }
                };
                collections.push(collection);
                cb(null,null);
            })
        },function(err,result){
            res.json({
                success:true,
                collections : collections
            });
        });
    });


});

module.exports = router;
