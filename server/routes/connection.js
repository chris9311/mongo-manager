'use strict';

var express = require('express');
var mongodb = require('mongodb').MongoClient;
var async = require('async');
var router = express.Router();

router.get('/getConnections', function (req, res) {

    var connections = req.connections;
    var connectionList = [];
    async.map(connections,function(connection,callback){
        var _connection = {};
        _connection.server = connection.server + ':' + connection.port;
        _connection.conn_name = connection.conn_name;
        connection.auth.sign ? _connection.user = connection.auth.user:null;
        var databases = connection.databases;
        var databaselist = [];
        async.map(databases,function(database,callback1){
            database.collections(function(err,collections) {
                if(err){
                    console.log(err);
                    callback1(err,null);
                }else{
                    var _datbase = {};
                    var collNames = [];
                    async.map(collections,function(coll,callback2){
                        var _coll = {
                            name : coll.s.name
                        };
                        collNames.push(_coll);
                        callback2(null,null);
                    },function(err,result){
                        _datbase = {
                            name : database.s.databaseName,
                            collNames : collNames
                        };
                        databaselist.push(_datbase);
                        callback1(null,null);
                    });
                }
            });
        },function(err,result){
            if(err){
                res.redirect('/database/databases')
            }else{
                _connection.databases = databaselist;
                connectionList.push(_connection);
                callback(null,null);
            }
        });
    }, function (err,result) {
        res.json({
            success : true,
            connections : connectionList
        })
    })
});

router.post('/save_connection', function (req,res) {

    var connection = req.body;
    var serverdb = req.serverdb;
    var connectionList = serverdb.collection('connectionlist');
    connectionList.insertOne(connection, function (err,result) {
        if(err){
            console.log('connection.js  70');
            console.log(err);
        }else{
            res.json({
                success : true
            })
        }
    });
});

router.post('/test_connection', function (req, res) {

    var connection = req.body;
    mongodb.connect('mongodb://'+connection.server+ ':' + connection.port + '/admin', function (err,db) {
        if(err){
            console.log('connection.js 82');
            console.log(err);
            res.json({
                success : false,
                error : err
            })
        }else if(!db){
            res.json({
                success : false,
                error : 'Database not exit!'
            })
        }else{
            if(connection.auth.sign){
                db.admin().authenticate(connection.auth.user,connection.auth.password, function (err,result){
                    if(err){
                        console.log('connection.js 97');
                        console.log(err);
                        res.json({
                            success : false,
                            error : err
                        })
                    }else if(!result){
                        res.json({
                            success : false,
                            error : 'user and password not match!'
                        })
                    }else{
                        res.json({
                            success : true,
                        })
                    }
                })
            }else{
                res.json({
                    success : true
                })
            }
        }
    })
});

router.delete('/del_connection/:conn_name/:server/:port', function (req, res) {

    var conn_name = req.params.conn_name;
    var server = req.params.server;
    var port = req.params.port;
    var serverdb = req.serverdb;
    var connectionList = serverdb.collection('connectionlist');
    connectionList.removeOne({conn_name:conn_name,server:server,port:port}, function (err,result) {
        if(err){
            console.log('connection.js  132');
            console.log(err);
            res.json({
                success : false,
                error : err
            })
        }else{
            res.json({
                success : true
            })
        }
    });
});

module.exports = router;