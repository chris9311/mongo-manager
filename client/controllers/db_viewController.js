var treecontroller = angular.module('tree_controller',[]);

treecontroller.controller('treeController', function ($rootScope,$scope,$http) {

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
    //$scope.$on('url_change', function (event,data) {
    //    console.log(data);
    //})
});

var dbviewcontroller = angular.module('dbview_controller',[]);
dbviewcontroller.controller('dbviewController',function($scope,$http,$rootScope,$routeParams){

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
    //$http.get('/database/getcollstats/'+dbName)
    //    .success(function(json){
    //       console.log(json);
    //    });
});

var indexviewcontroller = angular.module('indexview_controller',[]);
indexviewcontroller.controller('indexviewController',function($scope,$http){
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

var collviewcontroller = angular.module('collview_controller',[]);
collviewcontroller.controller('collviewController',function($scope,$http,$rootScope,$routeParams){

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

var docviewcontroller = angular.module('docview_controller',[]);
docviewcontroller.controller('docviewController',function($scope,$http,$rootScope,$routeParams){

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

var query = angular.module('query',[]);
query.controller('queryController', function ($scope,$http) {

});