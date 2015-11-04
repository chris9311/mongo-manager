/**
 * Created by HUANGCH4 on 2015/8/26.
 */
var app = angular.module('app',['ngRoute','tree_controller','dbview_controller',
    'breadcrumb_controller','collview_controller','docview_controller','indexview_controller',
    'proview_controller','upload_controller','fileList','command','daily','dailytask','current',
    'admin']);


app.config(function ($routeProvider) {

    //$locationProvider.html5Mode(true);

    $routeProvider
        .when('/',{
            templateUrl : 'client/views/pages/index.html'
        })
        .when('/database/:dbName',{
            templateUrl : 'client/views/pages/database.html'
        })
        .when('/collection/:dbName/:collName/:page',{
            templateUrl : 'client/views/pages/collection.html'
        })
        .when('/document/:dbName/:collName/:docId',{
            templateUrl : 'client/views/pages/document.html'
        })
        .when('/admin',{
            templateUrl : 'client/views/pages/admin.html'
        })
        .when('/admin/profile',{
            templateUrl : 'client/views/pages/system.profile.html'
        })
        //.when('/admin/profile/:sort/:page',{
        //    templateUrl : 'client/views/pages/system.profile.html'
        //})
        .when('/admin/checkfile',{
            templateUrl : 'client/views/pages/filelist.html'
        })
        .when('/admin/checkfile/command/:filename',{
            templateUrl : 'client/views/pages/commandjs.html'
        })
        .when('/admin/daily',{
            templateUrl : 'client/views/pages/dailytask_list.html'
        })
        .when('/admin/daily/newtask',{
            templateUrl : 'client/views/pages/newtask_page.html'
        })
        .when('/admin/currentop',{
            templateUrl : 'client/views/pages/currentop.html'
        })
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
});

app.filter('BtoKB',function(){
    return function(data){
        return data / 1024
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
            var _json = JSON.stringify(json, null, "\t");
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

app.directive('pagination_',function(){
    var li= '<nav class="text-center"> ' +
        '<ul class="pagination"> ' +
        '<li> ' +
        '<a href="" aria-label="Previous" ng-click="firstpage()"> ' +
        '<span aria-hidden="true">&laquo;</span> ' +
        '</a> ' +
        '</li> ' +
        '<li> ' +
        '<a ng-hide="sign == 1" href="" aria-label="Previous" ng-click="lastgroup()"> ' +
        '<span aria-hidden="true">...</span> ' +
        '</a> ' +
        '</li> ' +
        '<li ng-repeat="num in totalPages" ng-class=\'{true: "active", false: "inactive"}[currentPage==num]\'> ' +
        '<a  href={{url}}/{{num}} >' +
        '{{num}} ' +
        '</a> ' +
        '</li> ' +
        '<li> ' +
        '<a ng-hide="sign >= pages-9" href="" aria-label="Next" ng-click="nextgroup()"> ' +
        '<span aria-hidden="true">...</span> ' +
        '</a> ' +
        '</li> ' +
        '<li> ' +
        '<a href="" aria-label="Next" ng-click="lastpage()"> ' +
        '<span aria-hidden="true">&raquo;</span> ' +
        '</a> ' +
        '</li> ' +
        '</ul> ' +
        '</nav>';

    return {
        restrict : 'E',

        replace : true,
        template : li,
        link : function(scope,element,attrs) {
            scope.$emit('pageSize',attrs.pagesize);

            scope.$on(attrs.paginationName,function(even,data){

                scope.pages = data.totalPages;
                scope.totalPages = [];
                //scope.sign=data.currentPage;
                if(data.currentPage%10 == 0){
                    scope.sign = data.currentPage - 9 ;
                }else{
                    scope.sign = data.currentPage - data.currentPage%10 + 1 ;
                }
                scope.currentPage = data.currentPage;
                scope.url = attrs.url;
                if(scope.pages>10){
                    for (var i = 0; i < 10; i++) {
                        scope.totalPages.push(i + 1);
                    }
                }else{
                    for (var i = 0; i < scope.pages; i++) {
                        scope.totalPages.push(i + 1);
                    }
                }

                scope.currentPage = data.currentPage;
                scope.url = attrs.url;
                if(attrs.urlAtt1Name){
                    scope.url =  scope.url +"/"+ data[attrs.urlAtt1Name];
                }
                if(attrs.urlAtt2Name){
                    scope.url =  scope.url +"/"+ data[attrs.urlAtt2Name] ;
                }
            });

            scope.nextgroup = function(){
                scope.sign = parseInt(scope.sign)+10
            };
            scope.lastgroup = function(){
                if(parseInt(scope.sign)-10 >= 1){
                    scope.sign = parseInt(scope.sign)-10;
                }else{
                    scope.sign = 1;
                }
            };

            scope.$watch('sign',function(){
                if(scope.sign){
                    if(parseInt(scope.sign) >= parseInt(scope.pages)){
                        scope.sign =scope.pages - scope.pages%10 + 1;
                    }
                    var sign2 = parseInt(scope.sign);
                    var countpage = [];
                    for(; sign2 < parseInt(scope.sign)+10 && sign2 <= parseInt(scope.pages);sign2++){
                        countpage.push(sign2);
                    }
                    scope.totalPages = countpage;
                }
            });

            scope.firstpage = function(){
                window.location = scope.url +"/" + 1;
                scope.sign = 1;
            };

            scope.lastpage = function(){
                window.location = scope.url +"/" + scope.pages;
                scope.sign =scope.pages - scope.pages%10 + 1;
            };

        }
    };
})
    .directive('uploadFile',function(){
        return {
            restrict : 'E',
            replace : true,
            templateUrl : 'client/views/pages/uploadModal.html'
        }
    });;
