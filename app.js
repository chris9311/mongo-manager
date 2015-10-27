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

app.use(function(req, res, next) {
  var auth;

  if (req.headers.authorization) {
    auth = new Buffer(req.headers.authorization.substring(6), 'base64').toString().split(':');
  }

  if(auth && auth[0] && auth[1]){
    connectDb(auth[0],auth[1],function(result){
      if(result){
        adminDb.listDatabases(function(err, dbs) {
          if (err) {
            console.error(err);
          }
          for (var key in dbs.databases) {
            var dbName = dbs.databases[key]['name'];
            if (dbName == 'local' || dbName == 'admin') {
              continue;
            }
            databases[dbName] = adminConn.db(dbName);
            //dbsName.push(dbName);
          }
        });
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
  console.log(''+user+':'+pass+'');
  //mongodb.connect('mongodb://127.0.0.1:11111,127.0.0.1:22222,127.0.0.1:33333,127.0.0.1:44444,127.0.0.1:55555/admin', function (err,db) {
  mongodb.connect('mongodb://'+config.mongodb.server+'/admin', function (err,db) {
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
  req.databases = databases;
  //req.dbsName = dbsName;
  next();
};

app.use('/',middleware,router);

module.exports = app;
