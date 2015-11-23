'use strict';

var express = require('express');
var router = express.Router();
var database = require('./database');
var collection  = require('./collection');
var document  = require('./document');
var index = require('./index');
var admin = require('./admin');
var config = require('../../config');

//console.log('router init');

//// catch 404 and forward to error handler
//router.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});

// error handlers

// development error handler
// will print stacktrace
if (router.get('env') === 'development') {
    router.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
router.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

router.get('/getAddress', function (req, res) {
    res.json({
        success : true,
        currentAddress : global.dbAddress,
        addressList : config.mongodb.addressList
    })
});

router.use('/',index);
router.use('/database',database);
router.use('/collection',collection);
router.use('/document',document);
router.use('/admin',admin);

module.exports = router;
