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
var async = require('async');
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
  mongodb.connect('mongodb://'+config.serverDatabase.dbUrl+'/mmd', function (err,sdb) {
    if(err){
      console.log('app.js 38');
      console.log(err);
      next();
    }else{
      var connections = {};
      req.serverdb = sdb;
      var serverList = sdb.collection('connectionlist');
      serverList.find({}).toArray(function (err,conns) {
        if(err){
          console.log('app.js 48');
          console.log(err);
        }else{
          /////////////
          async.map(conns, function (connection,callback) {
            var connection = connection;
            var serverAddress = connection.server + ':' +connection.port;
            var conn_name = connection.conn_name;
            mongodb.connect('mongodb://'+serverAddress+'/admin', function (err,db) {
              if(err){
                console.log('app.js 57');
                console.log(err);
                next();
                callback(err,null);
              }else{
                connection.adminConn = db;
                connection.adminDb = db.admin();
                if(connection.auth.sign){
                  db.admin().authenticate(connection.auth.user,connection.auth.password, function (err,result) {
                    if(err){
                      console.log('app.js 59');
                      console.log(err);
                    }else{
                      db.admin().listDatabases(function (err,databases) {
                        if(err){
                          console.log('app.js 72');
                          console.log(err);
                        }else{
                          var _database = {};
                          async.map(databases.databases, function (database,callback2) {
                            var dbName = database['name'];
                            if (dbName != 'local' && dbName != 'admin') {
                              _database[dbName] = db.db(dbName);
                            }
                            callback2(null,null);
                          }, function (err,result) {//finished the databases
                            connection.databases = _database;
                            connections[conn_name] = connection;
                            callback(null,null);
                          })
                        }
                      })
                    }
                  })
                }else{
                  db.admin().listDatabases(function (err,databases) {
                    if(err){
                      console.log('app.js 94');
                      console.log(err);
                    }else{
                      var _database = {};
                      async.map(databases.databases, function (database,callback2) {
                        var dbName = database['name'];
                        //console.log('dbname: '+dbName);
                        if (dbName != 'local' && dbName != 'admin') {
                          _database[dbName] = db.db(dbName);
                        }
                        callback2(null,null);
                      }, function (err,result) {//finished the databases
                        connection.databases = _database;
                        connections[conn_name] = connection;
                        callback(null,null);
                      })
                    }
                  })
                }
              }
            })
          },function (err,result) {//finished the connections
            req.connections = connections;
            next();
          })
        }
      });
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

//app.get('/getConnections', function (req,res) {
//  var connections = req.connections;
//  var connectionList = [];
//  async.map(connections,function(connection,callback){
//    var _connection = {};
//    _connection.server = connection.server + ':' + connection.port;
//    _connection.conn_name = connection.conn_name;
//    connection.auth.sign ? _connection.user.name:null;
//    var databases = connection.databases;
//    var databaselist = [];
//    async.map(databases,function(database,callback1){
//      database.collections(function(err,collections) {
//        if(err){
//          console.log(err);
//          callback1(err,null);
//        }else{
//          var _datbase = {};
//          var collNames = [];
//          async.map(collections,function(coll,callback2){
//            var _coll = {
//              name : coll.s.name
//            };
//            collNames.push(_coll);
//            callback2(null,null);
//          },function(err,result){
//            _datbase = {
//              name : database.s.databaseName,
//              collNames : collNames
//            };
//            databaselist.push(_datbase);
//            callback1(null,null);
//          });
//        }
//      });
//    },function(err,result){
//      if(err){
//        res.redirect('/database/databases')
//      }else{
//        _connection.databases = databaselist;
//        connectionList.push(_connection);
//        callback(null,null);
//      }
//    });
//  }, function (err,result) {
//    res.json({
//      success : true,
//      connections : connectionList
//    })
//  })
//});

app.use('/',router);

module.exports = app;
