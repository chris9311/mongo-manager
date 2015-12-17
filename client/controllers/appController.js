var app = angular.module('app',['ngRoute','index_view','dbs_tree','db_view',
    'breadcrumb_controller','coll_view','doc_view','dbindex_view',
    'proview_controller','upload_controller','fileList','command','daily','dailytask','current',
    'admin','address']);


app.config(function ($routeProvider) {

    $routeProvider
        .when('/',{
            templateUrl : 'client/views/pages/index.html'
        })
        .when('/database/:conn_name',{
            templateUrl : 'client/views/pages/db_views/db_index.html'
        })
        .when('/database/:conn_name/:dbName',{
            templateUrl : 'client/views/pages/db_views/database.html'
        })
        .when('/collection/:conn_name/:dbName/:collName',{
            templateUrl : 'client/views/pages/db_views/collections_new.html'
        })
        .when('/document/:conn_name/:dbName/:collName/:docId',{
            templateUrl : 'client/views/pages/db_views/document.html'
        })
        .when('/admin',{
            templateUrl : 'client/views/pages/admin_views/admin.html'
        })
        .when('/admin/profile',{
            templateUrl : 'client/views/pages/admin_views/system.profile.html'
        })
        .when('/admin/checkfile',{
            templateUrl : 'client/views/pages/admin_views/filelist.html'
        })
        .when('/admin/checkfile/command/:filename',{
            templateUrl : 'client/views/pages/admin_views/commandjs.html'
        })
        .when('/admin/daily',{
            templateUrl : 'client/views/pages/admin_views/dailytask_list.html'
        })
        .when('/admin/daily/newtask',{
            templateUrl : 'client/views/pages/admin_views/newtask_page.html'
        })
        .when('/admin/currentop',{
            templateUrl : 'client/views/pages/admin_views/currentop.html'
        });
});

app.run(function ($rootScope,$location) {
    $rootScope.$on('$routeChangeStart', function(event) {
        $rootScope.urlStr = $location.url();
    });
});

app.controller('appController',function($rootScope,$scope){
    $rootScope.urlParams = {};
    $scope.$on('show_views',function(event,data){
        $scope.$broadcast('show_view',data);
    });

    $scope.$on('show_loading', function (event,data) {
        $scope.loading = true;
    });
    $scope.$on('hide_loading', function (event,data) {
        $scope.loading = false;
    })
});

app.filter('adaptSize',function(){
    return function(data){
        if(data){
            var check = data.toString().split('.');
            if(check <= 1023){
                return data.toFixed(2) + ' B';
            }else if(check >= 1024 && check < 1024*1024){
                return (data/1024).toFixed(2) + ' KB'
            }else if(check < 1024*1024*1024 && check >= 1024*1024){
                return (data/(1024*1024)).toFixed(2) + ' MB'
            }else{
                return (data/(1024*1024*1024)).toFixed(2) + ' GB'
            }
        }else{
            return '0B';
        }

    }
})
    .filter('trandate',function(){
        return function(data){
            var date = new Date(data);
            var _date = date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDate();
            return _date;
        }
    })
    .filter('ToJson',function(){
        return function(json){
            //var _json = JSON.stringify(json, null, "\t");
            var _json = angular.toJson(json,"\t");
            return _json;
        }
    });

//app.factory('mytest',function(){
//    return {
//        test : function(){
//            alert('sss');
//        }
//    }
//});
//app.factory('mytest2',function(){
//    return {
//        test : function(){
//            alert('ddd');
//        }
//    }
//});

//app.directive('pagination_',function(){
//    var li= '<nav class="text-center"> ' +
//        '<ul class="pagination"> ' +
//        '<li> ' +
//        '<a href="" aria-label="Previous" ng-click="firstpage()"> ' +
//        '<span aria-hidden="true">&laquo;</span> ' +
//        '</a> ' +
//        '</li> ' +
//        '<li> ' +
//        '<a ng-hide="sign == 1" href="" aria-label="Previous" ng-click="lastgroup()"> ' +
//        '<span aria-hidden="true">...</span> ' +
//        '</a> ' +
//        '</li> ' +
//        '<li ng-repeat="num in totalPages" ng-class=\'{true: "active", false: "inactive"}[currentPage==num]\'> ' +
//        '<a  href={{url}}/{{num}} >' +
//        '{{num}} ' +
//        '</a> ' +
//        '</li> ' +
//        '<li> ' +
//        '<a ng-hide="sign >= pages-9" href="" aria-label="Next" ng-click="nextgroup()"> ' +
//        '<span aria-hidden="true">...</span> ' +
//        '</a> ' +
//        '</li> ' +
//        '<li> ' +
//        '<a href="" aria-label="Next" ng-click="lastpage()"> ' +
//        '<span aria-hidden="true">&raquo;</span> ' +
//        '</a> ' +
//        '</li> ' +
//        '</ul> ' +
//        '</nav>';
//
//    return {
//        restrict : 'E',
//
//        replace : true,
//        template : li,
//        link : function(scope,element,attrs) {
//            scope.$emit('pageSize',attrs.pagesize);
//
//            scope.$on(attrs.paginationName,function(even,data){
//
//                scope.pages = data.totalPages;
//                scope.totalPages = [];
//                //scope.sign=data.currentPage;
//                if(data.currentPage%10 == 0){
//                    scope.sign = data.currentPage - 9 ;
//                }else{
//                    scope.sign = data.currentPage - data.currentPage%10 + 1 ;
//                }
//                scope.currentPage = data.currentPage;
//                scope.url = attrs.url;
//                if(scope.pages>10){
//                    for (var i = 0; i < 10; i++) {
//                        scope.totalPages.push(i + 1);
//                    }
//                }else{
//                    for (var i = 0; i < scope.pages; i++) {
//                        scope.totalPages.push(i + 1);
//                    }
//                }
//
//                scope.currentPage = data.currentPage;
//                scope.url = attrs.url;
//                if(attrs.urlAtt1Name){
//                    scope.url =  scope.url +"/"+ data[attrs.urlAtt1Name];
//                }
//                if(attrs.urlAtt2Name){
//                    scope.url =  scope.url +"/"+ data[attrs.urlAtt2Name] ;
//                }
//            });
//
//            scope.nextgroup = function(){
//                scope.sign = parseInt(scope.sign)+10
//            };
//            scope.lastgroup = function(){
//                if(parseInt(scope.sign)-10 >= 1){
//                    scope.sign = parseInt(scope.sign)-10;
//                }else{
//                    scope.sign = 1;
//                }
//            };
//
//            scope.$watch('sign',function(){
//                if(scope.sign){
//                    if(parseInt(scope.sign) >= parseInt(scope.pages)){
//                        scope.sign =scope.pages - scope.pages%10 + 1;
//                    }
//                    var sign2 = parseInt(scope.sign);
//                    var countpage = [];
//                    for(; sign2 < parseInt(scope.sign)+10 && sign2 <= parseInt(scope.pages);sign2++){
//                        countpage.push(sign2);
//                    }
//                    scope.totalPages = countpage;
//                }
//            });
//
//            scope.firstpage = function(){
//                window.location = scope.url +"/" + 1;
//                scope.sign = 1;
//            };
//
//            scope.lastpage = function(){
//                window.location = scope.url +"/" + scope.pages;
//                scope.sign =scope.pages - scope.pages%10 + 1;
//            };
//
//        }
//    };
//})
    app.directive('uploadFile',function(){
        return {
            restrict : 'E',
            replace : true,
            templateUrl : 'client/views/pages/admin_views/uploadModal.html'
        }
    });;
