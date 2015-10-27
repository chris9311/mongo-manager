var express = require('express');
var child_process = require('child_process');
//var fs = require('fs');
var path = require('path');
var router = express.Router();

router.get('/getdocuments/:dbName/:collName/:pagesize/:page',function(req,res){

    var dbName = req.params.dbName;
    var collName = req.params.collName;
    var page = parseInt(req.params.page,10)-1;
    var pagesize = parseInt(req.params.pagesize,10);
    var current = page * pagesize;
    var totalPages ;

    var db = req.databases[dbName];
    var collection = db.collection(collName);

    collection.count(function(err,count){
        //console.log(count);
        totalPages = Math.ceil(count / pagesize);
        collection.find({},{skip:current,limit:pagesize}).toArray(function(err,docs){
            console.log("totalPages:"+totalPages);
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


router.get('/export/:dbName/:collName', function (req,res) {

    var dbName = req.params.dbName;
    var collName = req.params.collName;
    var filepath = path.join(__dirname,'../../','server/shell/dumpcoll.sh');
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

module.exports = router;
