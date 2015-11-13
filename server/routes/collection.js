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


//router.post('/exportExcel/:dbName/:collName/:pageSize/:currentPage', function (req, res) {
router.get('/exportExcel', function (req, res) {

    //var dbName = req.params.dbName;
    //var collName = req.params.collName;
    //
    //console.log('dbName:'+dbName);
    //console.log('collName:'+collName);
    //
    //var query = undefined || req.body.query;
    //var sort = undefined || req.body.sort;
    //var fields = undefined || req.body.fields;
    //
    //console.log('query:'+query);
    //console.log('sort:'+sort);
    //console.log('fields:'+fields);
    //
    var db = req.databases['test'];
    var collection = db.collection('user');
    //if(query){
    //    query = '{' + query + '}';
    //    console.log(query);
    //    var jsonstr1 = eval('(' +query + ')');
    //    console.log(jsonstr1);
    //}
    //if(fields){
    //    fields = '{' + fields + '}';
    //    console.log(fields);
    //    var jsonstr2 = eval('(' +fields + ')');
    //    console.log(jsonstr2);
    //}
    //if(sort){
    //    sort = '{' + sort + '}';
    //    console.log(sort);
    //    var jsonstr3 = eval('(' +sort + ')');
    //    console.log(jsonstr3);
    //}
    collection.find().toArray(function (err,docs) {
        if(err){
            console.log(err);
        }else{
            //var data = {};
            exportExcel(docs,function (result) {
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=" + "Data.xlsx");
                res.end(result, 'binary');
            })
        }
    });
});


var exportExcel = function(data,cb){
    console.log(data);
    var conf ={
        cols:[],
        rows:[]
    };
    for(i in data){
        for(key in data[i]){
            console.log(key);
            if(conf.cols.length == 0){
                conf.cols.push({
                    caption : key,
                    type : String
                })
            }
            for(j in conf.cols){
                if(conf.cols[j].caption && key == conf.cols[j].caption){
                    continue;
                }else{
                    conf.cols.push({
                        caption : key,
                        type : String
                    })
                }
            }
        }
    }
    console.log(conf.cols);

    //conf.stylesXmlFile = "styles.xml";
    //conf.cols = [
    //    {caption:'test',type:String},
    //    {caption:'test2',type:String},
    //    {caption:'test3',type:String}
    //];

    conf.rows = [
        //['1111','2222','3333'],
        //['4444','5555','6666']
    ];

    var result = excel_export.execute(conf);
    //console.log(result);
    cb(result);
};

module.exports = router;
