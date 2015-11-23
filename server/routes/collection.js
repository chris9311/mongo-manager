'use strict';

var express = require('express');
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var excel_export = require('excel-export');
var router = express.Router();

router.get('/getdocuments/:dbName/:collName/:pageSize/:currentPage',function(req,res){

    var dbName = req.params.dbName;
    var collName = req.params.collName;
    var currentPage = parseInt(req.params.currentPage,10)-1;
    var pageSize = parseInt(req.params.pageSize,10);
    var current = currentPage * pageSize;
    var totalPages ;

    console.log('currentPage : '+ currentPage);
    console.log('current : '+ current + '-----' + (current+pageSize));

    var db = req.databases[dbName];
    var collection = db.collection(collName);
    collection.count(function(err,count){
        totalPages = Math.ceil(count / pageSize);
        collection.find({},{skip:current,limit:pageSize}).toArray(function(err,docs){
            if(err){
                console.log(err);
            }
            res.json({
                success : true,
                totalPages:totalPages,
                documents :  docs,

            })
        })
    });
});


/**
 * backup for pagenation
 */
//router.get('/getdocuments/:dbName/:collName',function(req,res){
//
//    var dbName = req.params.dbName;
//    var collName = req.params.collName;
//    var db = req.databases[dbName];
//    var collection = db.collection(collName);
//    collection.find().toArray(function (err,docs) {
//        if(err){
//            console.log(err);
//            res.json({
//                success : false,
//                err : err
//            });
//        }else{
//            res.json({
//                success : true,
//                documents : docs
//            })
//        }
//    })
//});


router.get('/export/:dbName/:collName', function (req,res) {

    var dbName = req.params.dbName;
    var collName = req.params.collName;

    var filepath = path.join(__dirname,'../../','server/shell/exportcollection.sh');
    var auth = new Buffer(req.headers.authorization.substring(6), 'base64').toString().split(':');
    child_process.execFile(filepath, [dbName,collName,auth[0],auth[1]],function (err,result) {
        if(err){
            console.log(err);
            res.json({
                err : err
            })
        } else{
            console.log(result);
            res.download('/tmp/mongo_dump/' + dbName + '_' + collName + '.zip',dbName + '_' + collName+'.zip')
        }
    })
});

router.post('/query/:dbName/:collName/:pageSize/:currentPage', function (req, res) {

    var dbName = req.params.dbName;
    var collName = req.params.collName;

    var currentPage = parseInt(req.params.currentPage,10)-1;
    var pageSize = parseInt(req.params.pageSize,10);
    var current = currentPage * pageSize;
    var totalPages ;

    console.log('dbName:'+dbName);
    console.log('collName:'+collName);

    var query = undefined || req.body.query;
    var sort = undefined || req.body.sort;
    var fields = undefined || req.body.fields;

    console.log('query:'+query);
    console.log('sort:'+sort);
    console.log('fields:'+fields);

    var db = req.databases[dbName];
    var collection = db.collection(collName);
    //var jsonstr = JSON.parse(query);
    //console.log(jsonstr);
    if(query){
        query = '{' + query + '}';
        console.log(query);
        var jsonstr1 = eval('(' +query + ')');
        console.log(jsonstr1);
    }
    if(fields){
        fields = '{' + fields + '}';
        console.log(fields);
        var jsonstr2 = eval('(' +fields + ')');
        console.log(jsonstr2);
    }
    if(sort){
        sort = '{' + sort + '}';
        console.log(sort);
        var jsonstr3 = eval('(' +sort + ')');
        console.log(jsonstr3);
    }
    collection.find(jsonstr1).count(function(err,count){
        //totalPages = Math.ceil(count / pageSize);
        collection.find(jsonstr1,jsonstr2,{skip:current,limit:pageSize}).sort(jsonstr3).toArray(function (err,docs) {
            if(err){
                console.log(err);
            }else{
                res.json({
                    success : true,
                    totalPages:count,
                    documents : docs
                })
            }
        })
    });
});


router.get('/exportExcel/:dbName/:collName/:query', function (req, res) {
//router.get('/exportExcel', function (req, res) {

    var dbName = req.params.dbName;
    var collName = req.params.collName;
    var query = undefined || req.params.query;
    //var sort = undefined || req.body.sort;
    //var fields = undefined || req.body.fields;

    var db = req.databases[dbName];
    var collection = db.collection(collName);

    var queryjson = {
        query : undefined,
        fields : undefined,
        sort : undefined,
    };
    if(query && query != 'null' ){
        //query = '{' + query + '}';
        var jsonstr = eval('(' +query + ')');

        queryjson.query = undefined || jsonstr.query;
        if(queryjson.query ){
            queryjson.query = '{' + queryjson.query + '}';
            queryjson.query = eval('(' +queryjson.query + ')');
        }
        queryjson.fields = undefined || jsonstr.fields;
        if(queryjson.fields){
            queryjson.fields = '{' + queryjson.fields + '}';
            queryjson.fields = eval('(' +queryjson.fields + ')');
        }
        queryjson.sort = undefined || jsonstr.sort;
        if(queryjson.sort){
            queryjson.sort = '{' + queryjson.sort + '}';
            queryjson.sort = eval('(' +queryjson.sort + ')');
        }
    }
    checkCollectionSize(collection,10485760, function (sign) {
        if(sign){
            collection.find(queryjson.query,queryjson.fields).sort(queryjson.sort).toArray(function (err,docs) {
                if(err){
                    console.log(err);
                }else{
                    exportExcel(docs,function (result) {
                        //console.log('result type : '+ typeof result);
                        //res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                        //res.setHeader("Content-Disposition", "attachment; filename=" + "Data.xlsx");
                        //res.end(result, 'binary');
                        var filename = 'Data.xlsx';
                        var filepath = path.join(__dirname,'../../','client/public/export/'+filename);
                        fs.writeFile(filepath,result,'binary', function (err) {
                            if(err){
                                console.log(err);
                                re.json({
                                    success : false
                                })
                            }else{
                                res.json({
                                    success : true,
                                    filename : filename
                                })
                            }
                        })
                    })
                }
            });
        }else{
            res.json({
                success : false,
                err : 'Collextion too big!'
            })
        }
    })
});

var exportExcel = function(data,cb){
    var conf ={
        cols:[],
        rows:[]
    };
    for(var i in data){
        for(var key in data[i]){

            var type  = typeof data[i][key];
            var width = 15;
            if(type == 'object'){
                type = 'string';
            }else if(type == 'string'){
                type = 'string';
            }else if(type == 'number'){
                type = 'number';
            }else{
                type = 'string';
            }

            if(conf.cols.length == 0){
                conf.cols.push({
                    caption : key,
                    type : type,
                    width:15
                })
            }else{
                var sign = 0;
                for(j in conf.cols){
                    if(conf.cols[j].caption && key == conf.cols[j].caption){
                        sign = 1;
                        break;
                    }else{
                        continue;
                    }
                }
                if(sign == 0){
                    conf.cols.push({
                        caption : key,
                        type : type,
                        width:15
                    })
                }
            }
        }
    }
    for(var i in  data){
        var values = [];
        for(var key in data[i]){
            for(var j in conf.cols){
                if(key == conf.cols[j].caption){
                    if(typeof data[i][key] == 'object'){
                        values[j] =JSON.stringify(data[i][key]);
                    }else{
                        values[j]=data[i][key].toString();
                    }
                }else{
                    if(!values[j])
                        values[j] = '';
                }
            }
        }
        conf.rows.push(values);
    }
    console.log('----------file generation-----------');
    var result = excel_export.execute(conf);
    cb(result);
};

router.get('/downloadExcel/:fileName', function (req,res) {

    var filename = req.params.fileName;
    var filepath = path.join(__dirname,'../../','client/public/export/'+filename);
    fs.exists(filepath, function (exists) {
        if(exists){
            res.download(filepath)
        }else{
            res.status(404);
            res.render('error', {
                message: '404 File Not found !',
                error: {}
            });
        }
    });
});

var checkCollectionSize = function (collection,maxSize,cb) {
    collection.stats(function (err,stats) {
        if(err){
            console.log(err);
            return;
        }else{
            var size = stats.size;
            console.log('size : '+size);
            console.log('sign : '+size <= maxSize ? true : false);
            cb(size <= maxSize ? true : false);
        }
    })
};

module.exports = router;
