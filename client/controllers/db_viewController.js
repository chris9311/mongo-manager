/**
 * DataBase tree moudule
 */
var dbs_tree = angular.module('dbs_tree',['ui.bootstrap']);
dbs_tree.controller('treeController', function ($rootScope,$scope,$http,$location) {

    $http.get('/connection/getConnections')
        .success(function (json) {
            if(json.success == true){
                $rootScope.connectionList = json.connections;
            }
        });
    //
    //$scope.$on('show_view',function(event,dbName){
    //    for(database in $scope.databases){
    //        if($scope.databases[database].name == $rootScope.urlParams.dbName){
    //            $scope.databases[database].showcollections =true;
    //        }else{
    //            $scope.databases[database].showcollections = false;
    //        }
    //    }
    //});

    $scope.sendDelData = function (conn_name,server) {
        var _server = server.split(':');
        $scope.deldata = {
            conn_name : conn_name,
            server : _server[0],
            port : _server[1]
        }
    };

    $scope.deleteConnection = function () {
        $http.delete('/connection/del_connection/'+$scope.deldata.conn_name+'/'+$scope.deldata.server+'/'+$scope.deldata.port)
            .success(function (json) {
                if(json.success){
                    window.location= '/';
                }
            })
    };

    $scope.redirect = function (conn_name) {
        console.log('init');
        //$location = '/'+conn_name;
        window.location = '#/database/'+conn_name ;
    }
});

dbs_tree.controller('addConnecntionController', function ($scope, $http) {

    var reset = function () {
        $scope.connection = {
            conn_name:'',
            server : '',
            port : '',
            auth : {
                sign : false,
                db : 'admin',
                user : '',
                password : ''
            }
        }
    };
    reset();
    $scope.clear = function () {
        reset();
    };
    
    $scope.testConnection = function () {
        if(!$scope.connection.auth.sign){
            $scope.connection.auth = {
                sign : false
            }
        }
        $http.post('/connection/test_connection',$scope.connection)
            .success(function (json) {
                if(json.success){
                    console.log(json.success)
                }
            })
    };
    
    $scope.saveConnection = function () {
        $http.post('/connection/save_connection',$scope.connection)
            .success(function (json) {
                if(json.success){
                    console.log(json.success);
                    window.location = '/';
                }
            })
    };
});

var breadcrumbcontroller = angular.module('breadcrumb_controller',[]);
breadcrumbcontroller.controller('breadcrumbController',function($scope,$rootScope,$location){

    $rootScope.$watch('urlStr', function () {
        var url = $rootScope.urlStr;
        var urlarry = [];
        if(url){
            var urllist = url.split('/');
            for(i in urllist){
                if(urllist[i]){
                    urlarry.push(urllist[i]);
                }
            }
            $scope.urlarry = urlarry;
        }
    });
});

var index_view = angular.module('index_view',[]);
index_view.controller('indexviewController',function($rootScope,$scope,$http,$routeParams){

    $rootScope.urlParams = $routeParams;
    $scope.conn_name = $routeParams.conn_name;
    $http.get('/database/getstats/'+$scope.conn_name)
        .success(function(json){
            if(json.success){
                //console.log(json);
                $scope.dbsstats = json.dbsstats;
            }
        });

    $scope.export = function () {
        $http.get('/database/export')
            .success(function (json) {
                if(json.success){
                    console.log(json);
                }
            })
    }
});

var db_view = angular.module('db_view',[]);
db_view.controller('dbviewController',function($scope,$http,$rootScope,$routeParams){

    $rootScope.urlParams = $routeParams;
    var conn_name = $routeParams.conn_name;
    $scope.maxSize = 10;
    $scope.bigCurrentPage = 1;
    $scope.itemsPerPage = 10;

    if(!$scope.collectionlist){
        var dbName = $routeParams.dbName;
        $scope.$emit('show_loading');
        $http.get('/database/getcollections/'+conn_name +'/'+ dbName)
            .success(function (json) {
                if(json.success){
                    $scope.collectionlist = json.collections;
                    $scope.bigTotalItems = $scope.collectionlist.length;
                    $scope.collections = $scope.collectionlist.slice(0,$scope.itemsPerPage);
                    $scope.$emit('show_views',null);
                    $scope.$emit('hide_loading');
                }
            });
    }

    $scope.$watch('bigCurrentPage', function () {
        if($scope.collectionlist){
            $scope.$emit('show_loading');
            $scope.collections = $scope.collectionlist.slice(($scope.bigCurrentPage-1)*$scope.itemsPerPage,($scope.bigCurrentPage-1)*$scope.itemsPerPage+$scope.itemsPerPage)
            $scope.$emit('hide_loading');
        }
    });
});

var coll_view = angular.module('coll_view',[]);
coll_view.controller('collviewController',function($scope,$http,$rootScope,$routeParams) {

    $rootScope.urlParams = $routeParams;
    $scope.conn_name =  $routeParams.conn_name;
    $scope.dbName = $routeParams.dbName;
    $scope.collName = $routeParams.collName;
    $scope.maxSize = 10;
    $scope.bigCurrentPage = 1;
    $scope.itemsPerPage = 15;
    $scope.findTmp = '';
    $scope.find = '';
    (function () {
        queryFun(1);
        $scope.$emit('show_views',null);
    })();

    function queryFun(page){
        $scope.$emit('show_loading');
        $http({
            method : 'POST',
            url : '/collection/query/'+ $scope.conn_name +'/' + $scope.dbName + '/' + $scope.collName+ '/' + $scope.itemsPerPage + '/' + page,
            data : $.param($scope.find),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (json) {
                if(json.success){
                    $scope.bigTotalItems = json.totalPages;
                    $scope.docs = json.documents;
                    $scope.$emit('hide_loading');
                }
            })
    }

    $scope.submit = function () {
        $scope.find = $scope.findTmp;
        queryFun(1);
    };

    $scope.$watch('bigCurrentPage', function () {
        if($scope.bigTotalItems){
            queryFun($scope.bigCurrentPage);
        }

    });
    $scope.show_detail = function (doc) {
        $scope.$broadcast('doc_detail',doc);
    };

    $scope.exportExcel = function () {
        $scope.$emit('show_loading');
        $scope.find = $scope.findTmp;
        $scope.find = $scope.findTmp;
        $scope.find = $scope.findTmp;
        var str = null;
        if($scope.find){
            str = JSON.stringify($scope.find);
        }
        $http.get('/collection/exportExcel/' + $scope.dbName + '/' + $scope.collName + '/' + str)
            .success(function (json) {
                if(json.success){
                    console.log('file generation');
                    $scope.$emit('hide_loading');
                    window.location = '/collection/downloadExcel/'+json.filename;
                }else{
                    if(json.err){
                        alert(json.err);
                        $scope.$emit('hide_loading');
                    }
                }
            })
    }
});

coll_view.directive('queryPage', function () {
    return {
        restrict : 'E',
        replace : true,
        templateUrl : 'client/views/pages/db_views/query.html',
    }
});

coll_view.directive('docDetail', function () {
    return {
        restrict : 'E',
        replace : true,
        templateUrl : 'client/views/pages/db_views/doc_detailModal.html',
    }
});

coll_view.filter('fields_count', function () {
    return function (docs) {
        var count = 0;
        for(key in docs){
            if(key == '$$hashKey'){
                continue;
            }
            count ++;
        }
        //console.log('************');
        return count;
    }
});

coll_view.filter('fields_detail', function () {
    function s(arr,json){
        for(key in json){
            var data = {
                key : key,
                value : []
            };
            if(typeof json[key] == 'object'){
                s(data.value,json[key]);
            }else{
                data.value = json[key];
            }
            arr.push(data);
        }
    }
    return function (docs) {
        var fields = [];
        s(fields,docs);
        return fields;
    }
});

coll_view.controller('doc_detailController', function ($scope) {
    $scope.$on('doc_detail', function (event,data) {
        $scope.doc_dt = data;
    })
});

coll_view.controller('queryController', function ($scope,$rootScope,$http,$routeParams) {
    $rootScope.urlParams = $routeParams;
    $scope.dbName = $routeParams.dbName;
    $scope.collName = $routeParams.collName;

    $scope.queryList = [];
    $scope.modifierList = [];
    $scope.projectionList = [];

    $scope.addQuery = function () {
        $scope.queryList.push({
            field : '',
            value : ''
        })
    };
    $scope.delQuery = function (index) {
        $scope.queryList.splice(index,1);
    };

    $scope.addModifier = function () {
        $scope.modifierList.push({
            field : '',
            //value : ''
        })
    };
    $scope.delModifier = function (index) {
        $scope.modifierList.splice(index,1);
    };

    $scope.addProjection = function () {
        $scope.projectionList.push({
            field : '',
            value : ''
        })
    };
    $scope.delProjection = function (index) {
        $scope.projectionList.splice(index,1);
    };

    $scope.submit = function () {
        var query = angular.toJson($scope.queryList);
        var modifier = angular.toJson($scope.modifierList);
        var projection = angular.toJson($scope.projectionList);

        $http.get('/collection/query/'+query+'/'+projection+'/'+modifier)
            .success(function (json) {
                if(json.success){
                    console.log(json.success);
                }
            })
    }
});

var doc_view = angular.module('doc_view',[]);
doc_view.controller('docviewController',function($scope,$http,$rootScope,$routeParams){

    $rootScope.urlParams = $routeParams;
    var dbName = $routeParams.dbName;
    var collName = $routeParams.collName;
    var docId = $routeParams.docId;
    if(!$rootScope.collPage){
        $rootScope.collPage = 1;
    }
    var _json = [];
    function s(arr,json){
        for(key in json){
            var data = {
                key : key,
                value : []
            };
            if(typeof json[key] == 'object'){
                s(data.value,json[key]);
            }else{
                data.value = json[key];
            }
            arr.push(data);
        }
    }

    $http.get('/document/getfields/' +dbName+ '/' +collName+ '/' + docId)
        .success(function(json){
            if(json.success==true){
                $scope.document = json.document;
                $scope.$emit('show_views',null);
                s(_json,json.document);
                $scope.document2 = _json;
            }
        });
})
    .filter('checktype',function() {
        return function (json) {
            var type = typeof(json);
            return type;
        }
    });

var address = angular.module('address',[]);
address.controller('addressController', function ($scope,$http) {

    $http.get('/getAddress')
        .success(function (data) {
            if(data.success){
                $scope.currentAddress = data.currentAddress;
                $scope.addressList = data.addressList;
            }
        });

    $scope.checkChange = function (ip) {
        $scope.tempAddress = ip;
    };

    $scope.changeAddress = function () {
        window.location = '/changeip/'+$scope.tempAddress;
    };
});