var express = require('express');
var async = require('async');
var child_process = require('child_process');
var path = require('path');
var router = express.Router();

//router.get('/databases/:server',function(req,res){
//
//    var server = req.params.server;
//    var databases = req.connection[server].databases;
//    var databaselist = [];
//    async.map(databases,function(database,callback2){
//        database.collections(function(err,collections) {
//            if(err){
//                console.log(err);
//                callback2(err,null);
//            }else{
//                var _datbase = {};
//                var collNames = [];
//                async.map(collections,function(coll,callback){
//                    var _coll = {
//                        name : coll.s.name
//                    };
//                    collNames.push(_coll);
//                    callback(null,null);
//                },function(err,result){
//                    _datbase = {
//                        name : database.s.databaseName,
//                        collNames : collNames
//                    };
//                    databaselist.push(_datbase);
//                    callback2(null,null);
//                });
//            }
//        });
//    },function(err,result){
//        if(err){
//            res.redirect('/database/databases')
//        }else{
//            res.json({
//                success:true,
//                databases : databaselist
//            });
//        }
//    });
//});

router.get('/getstats/:conn_name',function(req,res){

    var conn_name = req.params.conn_name;
    var databases = req.connections[conn_name].databases;
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
                nsSizeMB : stats.nsSizeMB
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

router.get('/getcollections/:conn_name/:dbName',function(req,res){

    var conn_name = req.params.conn_name;
    var databases = req.connections[conn_name].databases;
    var dbName = req.params.dbName;
    var db = databases[dbName];
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

router.get('/export/:conn_name/:dbName', function (req, res) {

    var dbName = req.params.dbName;
    var conn_name = req.params.conn_name;
    //var filepath = path.join(__dirname,'../../','server/shell/exportdatabase.sh');
    var filepath = '';
    var serverdb = req.serverdb;
    var connectionlist = serverdb.collection('connectionlist');
    connectionlist.findOne({conn_name:conn_name}, function (err,doc) {
        if(err){
            console.log('databases.js 125');
            console.log(err);
        }else{
            if(doc.auth.sign){
                filepath = path.join(__dirname,'../../','server/shell/exportdatabase_auth.sh');
                child_process.execFile(filepath, [doc.server,doc.port,doc.auth.user,doc.auth.password,dbName], function (err,result) {
                    resResult(err,result)
                });
            }else{
                filepath = path.join(__dirname,'../../','server/shell/exportdatabase.sh');
                child_process.execFile(filepath, [doc.server,doc.port,dbName], function (err,result) {
                    resResult(err,result)
                });
            }
        }
    });
    function resResult(err,result){
        if(err){
            console.log(err);
            res.json({
                success: false,
                err : err
            })
        }else{
            console.log(result);
            res.download('/tmp/mongo_dump/'+dbName+'.zip',''+dbName+'.zip');
        }
    }
});

module.exports = router;
