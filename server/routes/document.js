/**
 * Created by HUANGCH4 on 2015/8/27.
 */
var express = require('express');
var router = express.Router();

router.get('/getfields/:dbName/:collName/:docId',function(req,res){

    var dbName = req.params.dbName;
    var collName = req.params.collName;
    var docId = req.params.page,docId;

    var db = req.databases[dbName];
    var collection = db.collection(collName);

    collection.findOne({_id:docId},function(err,doc){
        if(err){
            console.log(err);
        }
        res.json({
            success : true,
            document :  doc,

        })
    });
});

module.exports = router;