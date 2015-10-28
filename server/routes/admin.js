var express = require('express');
var router = express.Router();
var filter  = require('./filter');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var async = require('async');
var child_process = require('child_process');
var config = require('../../config');
//var later = require('later');

var daily_tasklist =[];

//router.get('/profile/:pagesize/:page', function(req, res) {
//
//    var page = parseInt(req.params.page,10)-1;
//    var pagesize = parseInt(req.params.pagesize,10);
//    var adminConn = req.adminConn;
//    var admin = adminConn.db('admin');
//    var profile = admin.collection('system.profile');
//    profile.find().sort({ts:-1}).toArray(function(err,profiles){
//        filter.filters(page,pagesize,profiles,function(items,totalPages){
//            res.json({
//                profiles : items,
//                totalPages : totalPages,
//                success : true
//            })
//        });
//    })
//});
//
//router.get('/profile/:sort/:pagesize/:page', function(req, res) {
//
//
//    var sortStr = req.params.sort.split(":");
//    var sort = sortStr[0];
//    var sortSign ;
//    if(sortStr[1] == 'true'){
//        sortSign = 1;
//    }else{
//        sortSign = -1;
//    }
//    var page = parseInt(req.params.page,10)-1;
//    var pagesize = parseInt(req.params.pagesize,10);
//
//    var adminConn = req.adminConn;
//    var admin = adminConn.db('admin');
//    var profile = admin.collection('system.profile');
//
//    switch(sort) {
//        case 'op' : profile.find().sort({op:sortSign}).toArray(callback);break;
//        case 'ns' : profile.find().sort({ns:sortSign}).toArray(callback);break;
//        case 'ts' : profile.find().sort({ts:sortSign}).toArray(callback);break;
//        case 'millis' : profile.find().sort({millis:sortSign}).toArray(callback);break;
//    }
//
//    function callback(err,profiles){
//        filter.filters(page,pagesize,profiles,function(items,totalPages){
//            res.json({
//                profiles : items,
//                totalPages : totalPages,
//                success : true
//            })
//        });
//    }
//});

router.get('/profile/:dbName', function (req, res) {

    var dbName = req.params.dbName;
    var db = req.adminConn.db(dbName);
    //var db = req.databases[dbName];
    var profile = db.collection('system.profile');
    profile.find().toArray(function(err, docs) {
        console.log(docs);
        if(err){
            console.log(err);
            res.json({
                success : false
            })
        }
        res.json({
            success : true,
            profiles : docs
        })
    })
});

router.get('/currentOp', function (req, res) {

    //var currentop = "";
    var filepath = path.join(__dirname,'../../','server/data/');
    fs.readFile(filepath+'/'+'cu','utf-8',function(err,data){
        if(err){
            console.log(err);
        }

        var str = data.replace(/MongoDB.*\n.*\n/ig,'');
        var str2 = str.replace(/\nbye\n?/g,'');
        var str3 = str2.replace(/(NumberLong\(\S*\))/ig,'"$1"');
        var str4 = str3.replace(/(BinData\(\S*\))/ig,"'$1'");
        //console.log(data);

        var datajson = eval('(' + str4 + ')');
        var data = datajson.inprog;

        for(var i = 0;i < data.length ; i++){
            if(!data[i].secs_running){
                data[i].secs_running = 0;
            }
        }

        res.json({
            success : true,
            data : data
        })
    })
});

router.post('/upload/jsfile',multipartMiddleware,function(req,res){
    var file = req.files.file;
    //console.log(file);
    var filePath = file.path;
    var originalFilename = file.originalFilename;

    if(originalFilename){
        fs.readFile(filePath,function(err,data){
            if(err){
                console.log(err);
            }

            var newPath = path.join(__dirname,'../../','client/public/upload/js/'+originalFilename);
            fs.writeFile(newPath,data,function(err){
                if(err){
                    console.log(err);
                }
                fs.unlink(filePath,function(err){
                    if(err){
                        console.log(err);
                    }
                });
                res.json({
                    success : true
                })
            })
        })
    }
});

router.get('/filelist',function(req,res){

    var fileList = [];
    var folderList = [];

    var walk = function(path, fileList, folderList){
        var files = fs.readdirSync(path);
        async.map(files,function(item,callback) {
            var tmpPath = path + '/' + item,
                stats = fs.statSync(tmpPath);

            if (stats.isDirectory()) {
                walk(tmpPath, fileList, folderList);
                folderList.push(tmpPath);
            } else {
                fileList.push(item);
            }
            callback(null,null);
        },function(err,result){
            res.json({
                success : true,
                filelist : fileList
            })
        });
    };

    var filepath  = path.join(__dirname,'../../','client/public/upload/js');
    walk(filepath, fileList, folderList);

});


router.get('/readfile/:filename', function (req,res) {

    var filename = req.params.filename;
    var filepath = path.join(__dirname,'../../','client/public/upload/js');
    fs.readFile(filepath+'/'+filename,'utf-8',function(err,data){
        if(err){
            console.log(err);
        }
        res.json({
            success : true,
            data : data
        })
    })
});

router.get('/command/:database/:filename', function (req,res) {

    var filename = req.params.filename;
    var database = req.params.database;
    var filepath = path.join(__dirname,'../../','client/public/upload/js');
    var auth = new Buffer(req.headers.authorization.substring(6), 'base64').toString().split(':');
    var ipaddress = config.mongodb.server;
    var command = 'mongo 127.0.0.1/'+database+' -u '+auth[0]+' -p '+auth[1]+' --authenticationDatabase admin --shell '+filepath+'/'+filename+'';
    child_process.exec(command, function (err,stdout,stderr) {
        if(err){
            console.log(err);
        }
        res.json({
            success : true,
            data : stdout
        })
    })
});

router.get('/delete/:filename', function (req,res) {
    var filename = req.params.filename;
    var filepath = path.join(__dirname,'../../','client/public/upload/js');
    fs.unlink(filepath+'/'+filename,function (err){
        if(err){
            console.log(err);
        }else{
            res.json({
                success : true,
            })
        }
    });
});

router.get('/daily', function (req,res) {
    var command = 'cd / \nls';
    child_process.exec(command,function(err,stdout,stderr){
        if(err){
            console.log(err);
        }
        console.log(stdout);
        res.json({
            success : true,
        })
    })
});

router.get('/dailytasklist', function (req,res) {
    var command = 'crontab -l';
    child_process.exec(command,function (err,stdout,stderr) {
        if(err){
            console.log(err);
        }
        console.log(stdout);

        var tasklist=[];

        var testStr = stdout;
        var re = /([0-6]{0,1}[0-9]|\*)\s(2[0-3]|[0-1]?\d|\*)\s(3[0-1]|[0-2]?\d|\*)\s(1[0-2]|0?\d|\*)\s([0-6]|\*)\s(.*)/ig;
        var r = "";
        var num = 0;
        while(r = re.exec(testStr)) {
            var task ={
                num : num,
                taskStr : r[0],
                dt : {
                    min : r[1],
                    hour : r[2],
                    day : r[3],
                    mon : r[4],
                    weekday : r[5]
                },
                cmd: r[6]
            };
            tasklist.push(task);
            num ++;
        }

        daily_tasklist = tasklist;
        res.json({
            success : true,
            tasklist : tasklist
        })
    });
});


router.get('/newhourlytask/:min/:sign/:task', function (req,res) {
    console.log('hourly task');

    var min  = req.params.min;
    var sign  = req.params.sign;
    var taskname  = req.params.task;
    var dt = ''+min+' * * * *';
    if(sign == '0'){
        var task = taskname;
    }else{
        var task = path.join(__dirname,'../../','client/public/upload/'+taskname);
    }
    var filepath = path.join(__dirname,'../../','server/shell/crontab.sh');
    child_process.execFile(filepath, [dt, task], function (err, result) {
        if(err){
            console.log(err);
        }
        res.json({
            success : true
        });
    });
});

router.get('/newdailytask/:hour/:min/:sign/:task', function (req,res) {

    console.log('daily task');
    var hour = req.params.hour;
    var min = req.params.min ;
    var sign  = req.params.sign;
    var taskname  = req.params.task;
    var dt = ''+min+' '+hour+' * * *';

    if(sign == '0'){
        var task = taskname;
    }else{
        var task = path.join(__dirname,'../../','client/public/upload/'+taskname);
    }

    var filepath = path.join(__dirname,'../../','server/shell/crontab.sh');
    console.log(filepath);
    child_process.execFile(filepath, [dt, task], function (err, result) {

        if(err){
            console.log(err);
        }

        res.json({
            success : true
        });
    });

});

router.get('/newweeklytask/:weekday/:hour/:min/:sign/:task', function (req, res) {

    console.log('weekly task');
    var weekday = req.params.weekday;
    var hour = req.params.hour;
    var min = req.params.min ;
    var sign  = req.params.sign;
    var taskname  = req.params.task;

    var dt = ''+min+' '+hour+' * * '+weekday+'';
    if(sign == '0'){
        var task = taskname;
    }else{
        var task = path.join(__dirname,'../../','client/public/upload/'+taskname);
    }
    var filepath = path.join(__dirname,'../../','server/shell/crontab.sh');
    console.log(filepath);
    child_process.execFile(filepath, [dt, task], function (err, result) {

        if(err){
            console.log(err);
        }
        res.json({
            success : true
        });
    });
});

router.get('/newmonthlytask/:day/:hour/:min/:sign/:task', function (req, res) {

    console.log('weekly task');
    var day = req.params.day;
    var hour = req.params.hour;
    var min = req.params.min ;
    var sign  = req.params.sign;
    var taskname  = req.params.task;

    var dt = ''+min+' '+hour+' '+day+' * *';
    if(sign == '0'){
        var task = taskname;
    }else{
        var task = path.join(__dirname,'../../','client/public/upload/'+taskname);
    }
    var filepath = path.join(__dirname,'../../','server/shell/crontab.sh');
    child_process.execFile(filepath, [dt, task], function (err, result) {

        if(err){
            console.log(err);
        }
        res.json({
            success : true
        });
    });
});

router.get('/newyearlytask/:mon/:day/:hour/:min/:sign/:task', function (req, res) {

    console.log('yearly task');
    var mon = req.params.mon;
    var day = req.params.day;
    var hour = req.params.hour;
    var min = req.params.min ;
    var sign  = req.params.sign;
    var taskname  = req.params.task;

    var dt = ''+min+' '+hour+' '+day+' '+mon+' *';
    if(sign == '0'){
        var task = taskname;
    }else{
        var task = path.join(__dirname,'../../','client/public/upload/'+taskname);
    }
    var filepath = path.join(__dirname,'../../','server/shell/crontab.sh');
    console.log(filepath);
    child_process.execFile(filepath, [dt, task], function (err, result) {

        if(err){
            console.log(err);
        }
        res.json({
            success : true
        });
    });
});


//function wirte_taskfile(tasklist,cb){
//
//    var filepath = path.join(__dirname,'../../','server/data/dailytask/tasklist.js');
//    var template = 'module.exports ={' +
//        'tasklist : '
//        + tasklist +
//        '};';
//    fs.writeFile(filepath,template, cb(err));
//}

router.get('/updatetasklist/:taskno', function (req,res) {

    console.log(daily_tasklist);

    child_process.exec('crontab -r', function (err,stdout,stderr) {
        if(err){
            console.log(err);
        }else{
            var taskno = req.params.taskno;

            async.mapSeries(daily_tasklist, function (task,cb) {
                if(task.num == taskno){
                    cb(null,null);
                }else{
                    var dt = ''+task.dt.min+' '+task.dt.hour+' '+task.dt.day+' '+task.dt.mon+' '+task.dt.weekday+'';
                    console.log(dt);
                    var task_ = task.cmd;
                    console.log(task_);
                    var filepath = path.join(__dirname,'../../','server/shell/crontab.sh');
                    console.log(filepath);
                    child_process.execFile(filepath, [dt, task_], function (err, result) {
                        console.log('*********');
                        if(err){
                            console.log(err);
                        }
                        cb(null,null);
                    });
                }
            },function (err,result) {
                res.json({
                    success : true
                });
            });
        }
    });
});


module.exports = router;
