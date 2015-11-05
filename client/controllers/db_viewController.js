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

    if(!$scope.collectionlist){
        var dbName = $routeParams.dbName;
        $http.get('/database/getcollections/'+dbName)
            .success(function (json) {
                if(json.success){
                    $scope.collectionlist = json.collections;
                    $scope.$emit('show_views',null);
                }
            });
    }
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
coll_view.controller('collviewController',function($scope,$http,$rootScope,$routeParams){

    $rootScope.urlParams = $routeParams;
    var dbName = $routeParams.dbName;
    var collName = $routeParams.collName;
    var page = $routeParams.page;
    $rootScope.collPage = $routeParams.page;

    $scope.$on('pageSize',function(event,data){
        $rootScope.pagesize = data;
        var pagesize = $rootScope.pagesize;

        $http.get('/collection/getdocuments/'+dbName+ '/' +collName+ '/' +pagesize+ '/' +page)
            .success(function (json) {
                if(json.success){
                    //$scope.documents = JSON.stringify(json.documents, null, "\t");
                    $scope.documents = json.documents;
                    if(json.documents.length != 0){
                        var data = {
                            totalPages : json.totalPages,
                            currentPage : page,
                            dbName : dbName,
                            collName : collName
                        };
                        $scope.$broadcast('documents',data);
                        $scope.$emit('show_views',null);
                    }
                }
            });
    });

    $scope.getfield = function(docId){
        window.location = '#/document/' +dbName+ '/' +collName+ '/' + docId ;
    }
});

coll_view.directive('querypage', function () {

    return {
        restrict : 'E',
        replace : true,
        templateUrl : 'client/views/pages/db_views/query.html',
    }
});

coll_view.controller('queryController', function ($scope,$rootScope,$http,$routeParams) {

    $scope.show_query = false;
    $rootScope.urlParams = $routeParams;
    var dbName = $routeParams.dbName;
    var collName = $routeParams.collName;

    $scope.submit = function () {
        console.log('dbName:'+dbName);
        console.log('collName:'+collName);
        console.log('query:'+$scope.find.query);
        console.log('fields:'+$scope.find.fields);
        console.log('sort:'+$scope.find.sort);

        $http({
            method : 'POST',
            url : '/collection/query/' + dbName + '/' + collName,
            data : $.param($scope.find),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (json) {
                if(json.success){
                    console.log(json.success);
                    console.log(json.docs);
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
