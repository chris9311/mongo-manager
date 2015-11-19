/**
 * DataBase tree moudule
 */
var dbs_tree = angular.module('dbs_tree',[]);
dbs_tree.controller('treeController', function ($rootScope,$scope,$http) {

    $http.get('/database/databases')
        .success(function (json) {
            if(json.success){
                $scope.databases = json.databases;
                $rootScope.dbs = json.databases;
            }
        });

    $scope.$on('show_view',function(event,dbName){
        for(database in $scope.databases){
            if($scope.databases[database].name == $rootScope.urlParams.dbName){
                $scope.databases[database].showcollections =true;
            }else{
                $scope.databases[database].showcollections = false;
            }
        }
    });
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

var db_view = angular.module('db_view',[]);
db_view.controller('dbviewController',function($scope,$http,$rootScope,$routeParams){

    $rootScope.urlParams = $routeParams;
    $scope.maxSize = 10;
    $scope.bigCurrentPage = 1;
    $scope.itemsPerPage = 10;

    if(!$scope.collectionlist){
        var dbName = $routeParams.dbName;
        $http.get('/database/getcollections/' + dbName)
            .success(function (json) {
                if(json.success){
                    $scope.collectionlist = json.collections;
                    $scope.bigTotalItems = $scope.collectionlist.length;
                    $scope.collections = $scope.collectionlist.slice(0,$scope.itemsPerPage);
                    $scope.$emit('show_views',null);
                }
            });
    }

    $scope.$watch('bigCurrentPage', function () {
        if($scope.collectionlist){
            $scope.collections = $scope.collectionlist.slice(($scope.bigCurrentPage-1)*$scope.itemsPerPage,($scope.bigCurrentPage-1)*$scope.itemsPerPage+$scope.itemsPerPage)
        }
    });
});



var index_view = angular.module('index_view',[]);
index_view.controller('indexviewController',function($scope,$http){
    $http.get('/database/getstats')
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

var coll_view = angular.module('coll_view',[]);
coll_view.controller('collviewController',function($scope,$http,$rootScope,$routeParams) {

    $rootScope.urlParams = $routeParams;
    $scope.dbName = $routeParams.dbName;
    $scope.collName = $routeParams.collName;
    //var page = $routeParams.page;
    //$rootScope.collPage = $routeParams.page;
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
        $http({
            method : 'POST',
            url : '/collection/query/' + $scope.dbName + '/' + $scope.collName+ '/' + $scope.itemsPerPage + '/' + page,
            data : $.param($scope.find),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (json) {
                if(json.success){
                    //console.log(json.success);
                    //$scope.$emit('queryResult',json.docs)
                    $scope.bigTotalItems = json.totalPages;
                    $scope.docs = json.documents;
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
    //$scope.getfield = function(docId){
    //    window.location = '#/document/' +dbName+ '/' +collName+ '/' + docId ;
    //};
    $scope.show_detail = function (doc) {
        $scope.$broadcast('doc_detail',doc);
    };

    $scope.exportExcel = function () {
        //console.log(typeof JSON.stringify($scope.find));
        $scope.find = $scope.findTmp;
        $scope.find = $scope.findTmp;
        $scope.find = $scope.findTmp;
        var str = null;
        if($scope.find){
            str = JSON.stringify($scope.find);
        }
        window.location = '/collection/exportExcel/' + $scope.dbName + '/' + $scope.collName + '/' + str;
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
            count ++;
            //console.log(count + '--' +key)
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

//coll_view.controller('queryController', function ($scope,$rootScope,$http,$routeParams) {
//
//    $scope.show_query = false;
//    $rootScope.urlParams = $routeParams;
//    $scope.dbName = $routeParams.dbName;
//    $scope.collName = $routeParams.collName;
//    $scope.find = '';
//
//    $scope.submit = function () {
//        $http({
//            method : 'POST',
//            url : '/collection/query/' + $scope.dbName + '/' + $scope.collName,
//            data : $.param($scope.find),
//            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
//        })
//            .success(function (json) {
//                if(json.success){
//                    //console.log(json.success);
//                    $scope.$emit('queryResult',json.docs)
//                }
//            })
//    }
//});

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