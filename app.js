var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');
var mongodb = require('mongodb');
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

var adminConn;
var adminDb;
var databases = {};
global.dbAddress = '';

app.use(function (req,res,next) {
  if(global.dbAddress){
    next();
  }else{
    global.dbAddress = config.mongodb.default;
    next();
  }
});

app.use(function(req, res, next) {
  var auth;
  if (req.headers.authorization) {
    auth = new Buffer(req.headers.authorization.substring(6), 'base64').toString().split(':');
  }

  if(auth && auth[0] && auth[1]){
    connectDb(auth[0],auth[1],function(result){
      if(result){
        next();
      }else{
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        res.end('Unauthorized');
      }
    });
  }else{
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
    res.end('Unauthorized');
  }
});

function connectDb(user,pass,cb){
  //mongodb://user:pass@host:port/dbname
  //mongodb.connect('mongodb://127.0.0.1:11111,127.0.0.1:22222,127.0.0.1:33333,127.0.0.1:44444,127.0.0.1:55555/admin', function (err,db) {
  //fm_owner:fm_owner@10.222.48.252:27017,10.222.48.253:27017,10.222.48.254:27017/ssm?replicaSet=ssmfmrep;readPreference=secondaryPreferred
  mongodb.connect('mongodb://'+global.dbAddress+'/admin', function (err,db) {
  //mongodb.connect('mongodb://fm_owner:fm_owner@10.222.48.252:27017,10.222.48.253:27017,10.222.48.254:27017/ssm?replicaSet=ssmfmrep;readPreference=secondaryPreferred', function (err,db) {
    if(err){
      console.log(err);
    }

    adminConn = db;
    adminDb = db.admin();
    adminDb.authenticate(user, pass,function(err,result){
      cb(result);
    });
  })
}

var middleware = function(req, res, next) {
  req.adminDb = adminDb;
  req.adminConn = adminConn;
  var databases ={};
  adminDb.listDatabases(function(err, dbs) {
    if (err) {
      console.error(err);
    }
    if(dbs && dbs.databases){
      for (var key in dbs.databases) {
        var dbName = dbs.databases[key]['name'];
        if (dbName == 'local' || dbName == 'admin') {
          continue;
        }
        databases[dbName] = adminConn.db(dbName);
      }
    }
    req.databases = databases;
    next();
  });
};

app.get('/changeip/:ip', function (req,res) {
  var ip = req.params.ip;
  var sign = 0;
  for(i in config.mongodb.addressList){
    if(ip == config.mongodb.addressList[i]){
      sign = 1;
      break;
    }else{
      continue;
    }
  }
  if(sign = 1){
    global.dbAddress = ip;
    res.redirect('/')
  }else{
    res.statusCode = 404;
  }
});

app.use('/',middleware,router);

module.exports = app;
