var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');
var mongodb = require('mongodb').MongoClient;
var fs = require('fs');
var router = require('./server/routes/router');
var app = express();
var config = require('./config');
app.set('views', path.join(__dirname, 'client/views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

//var adminConn;
//var adminDb;
//var databases = {};
//global.dbAddress = '';

//app.use(function (req,res,next) {
//  if(global.dbAddress){
//    next();
//  }else{
//    global.dbAddress = config.mongodb.default;
//    next();
//  }
//});

app.use(function (req,res,next) {
  mongodb.connect('mongodb://'+config.serverDatabase.dbUrl+'/mmd', function (err,db) {
    if(err){
      console.log(err);
      next();
    }else{
      req.mmdb = db;
      next();
    }
  })
});

//app.use(function(req, res, next) {
//  var auth;
//  if (req.headers.authorization) {
//    auth = new Buffer(req.headers.authorization.substring(6), 'base64').toString().split(':');
//  }
//  if(auth && auth[0] && auth[1]){
//    mongodb.connect('mongodb://'+config.mongodb.default+'/admin', function (err,db) {
//      if(err){
//        console.log(err);
//        next();
//      }else{
//        db.authenticate(auth[0],auth[1], function (err,result) {
//          if(err){
//            console.log(err);
//            next();
//          }else if(!result){
//            console.log('authenticate fail');
//            res.statusCode = 401;
//            res.setHeader('WWW-Authenticate', 'Basic realm="Databases UserName and Password"');
//            res.end('Unauthorized');
//          }else{
//            adminConn = db;
//            adminDb = db.admin();
//            adminDb.listDatabases(function(err, dbs) {
//              var _databases = {};
//              if (err) {
//                console.error(err);
//                res.redirect(req.url);
//              }else{
//                if (dbs && dbs.databases) {
//                  for (var key in dbs.databases) {
//                    var dbName = dbs.databases[key]['name'];
//                    if (dbName == 'local' || dbName == 'admin') {
//                      continue;
//                    }
//                    _databases[dbName] = adminConn.db(dbName);
//                  }
//                  databases = _databases;
//                  next();
//                }
//              }
//            });
//          }
//        })
//      }
//    });
//  }else{
//    res.statusCode = 401;
//    res.setHeader('WWW-Authenticate', 'Basic realm="Databases UserName and Password"');
//    res.end('Unauthorized');
//  }
//});

//var middleware = function(req, res, next) {
//  req.adminDb = adminDb;
//  req.adminConn = adminConn;
//  req.databases = databases;
//  next();
//};
//
//app.get('/changeip/:ip', function (req,res) {
//  var ip = req.params.ip;
//  var sign = 0;
//  for(i in config.mongodb.addressList){
//    if(ip == config.mongodb.addressList[i]){
//      sign = 1;
//      break;
//    }else{
//      continue;
//    }
//  }
//  if(sign = 1){
//    global.dbAddress = ip;
//    res.redirect('/')
//  }else{
//    res.statusCode = 404;
//  }
//});

//app.use('/',middleware,router);

app.get('/getConnections', function (req,res) {
  var serverDatabase = req.mmdb;
  var connectionlist = [];
  var collection = serverDatabase.collection('connectionlist');
  collection.find({}).toArray(function (err,coll) {
    //console.log(coll);
    if(err){
      console.log(err);
    }else{
      for(i in coll){
        var connection = {
          server : coll[i].server,
          conn_name : coll[i].conn_name
        };
        if(coll[i].auth.sign){
          connection.username = coll[i].auth.user;
        }
        connectionlist.push(connection);
      }
      res.json({
        success : true,
        connectionlist : connectionlist
      })
    }
  });
});

app.use('/',router);

module.exports = app;
