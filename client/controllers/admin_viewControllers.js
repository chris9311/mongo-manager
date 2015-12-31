var admin = angular.module('admin',[]);
admin.controller('adminController', function ($scope,$http) {

    $scope.show_upload = function () {
        $scope.$emit('reloadModal','');
    };
    $scope.$emit('hide_loading');
});

var profileviewcontroller = angular.module('proview_controller',['ui.bootstrap']);
profileviewcontroller.controller('proviewController',function($scope,$rootScope,$http,$routeParams){

    //var page = $routeParams.page;
    //var sort = $routeParams.sort;
    //var pagesize;
    $scope.maxSize = 10;
    $scope.bigCurrentPage = 1;
    $scope.sort = {
        sort : '',
        sign : ''
    };

    $scope.connection = 'Choose Connection';

    $scope.db = 'Choose DataBase';

    //
    //$http.get('/database/databases')
    //    .success(function (json) {
    //        $scope.dblist = json.databases;
    //    });

    $scope.change_conn = function (connection) {
        $scope.dblist  = connection.databases;
        $scope.connection = connection.conn_name;
        $scope.db = 'Choose DataBase';
        $scope.enableDb = true;
    };

    $scope.change_db = function (dbName) {
        $scope.db =  dbName;
    };

    $scope.$watch('db', function () {
        if($scope.db != 'Choose DataBase'){
            $http.get('/admin/profile/'+ $scope.connection +'/'+$scope.db)
                .success(function (json) {
                    $scope.bigTotalItems = json.profiles.length;
                    $scope.profileslist = json.profiles;
                    $scope.bigCurrentPage = 1;
                    $scope.profiles= $scope.profileslist.slice(($scope.bigCurrentPage-1)*10,($scope.bigCurrentPage-1)*10 + 10);
                })
        }
    });

    $scope.$watch('bigCurrentPage', function () {
        if($scope.profileslist){
            $scope.profiles= $scope.profileslist.slice(($scope.bigCurrentPage-1)*10,($scope.bigCurrentPage-1)*10 + 10);
        }
    });

    $scope.change_sort = function(sort){

        if($scope.profileslist && $scope.profileslist.length != 0){
            $scope.sort.sort = sort;
            $scope.sort.sign = !$scope.sort.sign;
            $scope.profileslist = $scope.profileslist.sort(function (a,b) {
                if($scope.sort.sort == 'op' || $scope.sort.sort == 'ns'){
                    if($scope.sort.sign){
                        return a[$scope.sort.sort] > b[$scope.sort.sort];
                    }
                    return a[$scope.sort.sort] < b[$scope.sort.sort];
                }else{
                    if($scope.sort.sign){
                        return a[$scope.sort.sort] - b[$scope.sort.sort];
                    }
                    return b[$scope.sort.sort] - a[$scope.sort.sort];
                }
            });

            $scope.bigCurrentPage = 1;
            $scope.profiles= $scope.profileslist.slice(($scope.bigCurrentPage-1)*10,($scope.bigCurrentPage-1)*10 + 10);
        }
    };

    $scope.showdoc = function(doc){
        $scope.profiledoc = doc;
    }
});

var uploadcontroller = angular.module('upload_controller',['ngFileUpload']);
uploadcontroller.controller('uploadController',function($http,$scope,$timeout,Upload){

    $scope.progressPercentage = '0%';

    $scope.$on('reloadModal', function (event,data) {
        $scope.progressPercentage = '0%';
    });

    $scope.upload = function () {
        var str = $scope.uploadfile.name.split('.');
        //var type = str[str.length - 1];
        //if (type == 'js'){
        //    Upload.upload({
        //        'url' : '/admin/upload/jsfile',
        //        'file' : $scope.uploadfile
        //    }).progress(function(evt){
        //        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        //        $scope.progressPercentage = progressPercentage + '%';
        //        $scope.$emit('get_filename',evt.config.file.name);
        //    }).success(function (data, status) {
        //        if(data.success == true){
        //            $timeout(function () {
        //                alert('Upload Complete');
        //            });
        //        }else{
        //            $timeout(function () {
        //                alert(data.error+' Pls chack and upload again.');
        //            });
        //        }
        //    }).error(function (data, status) {
        //        alert('Upload Error! Pls upload again! \n Error Status: ' + status);
        //    });
        //}else{
        //    alert('File type error! Pls choose the .js file.')
        //}

        Upload.upload({
            'url' : '/admin/upload/jsfile',
            'file' : $scope.uploadfile
        }).progress(function(evt){
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.progressPercentage = progressPercentage + '%';
            $scope.$emit('get_filename',evt.config.file.name);
        }).success(function (data, status) {
            if(data.success == true){
                $timeout(function () {
                    alert('Upload Complete');
                });
            }else{
                $timeout(function () {
                    alert(data.error+' Pls chack and upload again.');
                });
            }
        }).error(function (data, status) {
            $scope.progressPercentage = '0%';
            $timeout(function () {
                alert('Upload Error! Pls upload again! \n Error Status: ' + status);
            });
        });
    };
});

var filelist = angular.module('fileList',[]);
filelist.controller('filelistController',function($scope,$http,$rootScope){
    $http.get('/admin/filelist')
        .success(function(json){
            if(!json.success){
                console.log(json.err);
            }else{
                $scope.filelist = json.filelist;
            }
        });

    $scope.readfile = function(filename){
        $http.get('/admin/readfile/' + filename)
            .success(function(json){
                $scope.filedata = json.data;
            });
    };

    $scope.delete = function (filename) {
        $http.get('/admin/delete/'+filename)
            .success(function (json) {
                if(json.success == true){
                    $http.get('/admin/filelist')
                        .success(function(json){
                            if(!json.success){
                                console.log(json.err);
                            }else{
                                $scope.filelist = json.filelist;
                            }
                        });
                }
            })
    }
})
    .filter('type',function(){
        return function(filename){
            var str = filename.split('.');
            var lenght = str.length;
            return str[lenght - 1];
        }
    })
    .directive('profileDetail',function(){
        return {
            restrict : 'E',
            replace : true,
            templateUrl : 'client/views/pages/admin_views/detailModal.html',
        }
    });

var command = angular.module('command',[]);
command.controller('commandController',function($scope,$rootScope,$http,$routeParams){

    var filename = $routeParams.filename;
    $scope.filename = $routeParams.filename;
    $scope.command = function(){
        $http.get('/admin/command/'+ $scope.connection + '/' + $scope.db + '/' + filename)
            .success(function(json){
                $scope.filedata = json.data;
            });
    };

    $scope.connection = 'Choose Connection';
    $scope.db = 'Choose DataBase';

    $scope.change_conn = function (connection) {
        $scope.dblist  = connection.databases;
        $scope.connection = connection.conn_name;
        $scope.db = 'Choose DataBase';
        $scope.enableDb = true;
    };

    $scope.change_db = function (dbName) {
        $scope.db =  dbName;
    };
});

var daily = angular.module('daily',[]);
daily.controller('dailyController', function ($scope,$rootScope,$http,$routeParams) {



    $http.get('/admin/dailytasklist')
        .success(function (json) {
            if(json.success == false){
                console.log(json.error);
            }else{
                $scope.tasklist = json.tasklist;
            }
        });

    $scope.delete = function(num){
        $http.get('/admin/updatetasklist/'+num)
            .success(function (json) {
                if(json.success){
                    console.log(json.success);
                }
                $http.get('/admin/dailytasklist')
                    .success(function (json) {
                        if(json.success == false){
                            console.log(json.error);
                        }else{
                            $scope.tasklist = json.tasklist;
                        }
                    });
            })
    }
});

var dailytask = angular.module('dailytask',['ui.bootstrap']);
dailytask.controller('newtaskController', function ($scope,$http) {

    $scope.tasktype = 'hourly';
    $scope.show_setFile = false;

    $scope.hourly = function(){
        $scope.tasktype = 'hourly';
    };
    $scope.daily = function(){
        $scope.tasktype = 'daily';
    };
    $scope.weekly = function(){
        $scope.tasktype = 'weekly';
    };
    $scope.monthly = function(){
        $scope.tasktype = 'monthly';
    };
    $scope.yearly = function(){
        $scope.tasktype = 'yearly';
    };

    $scope.change_setTask_view = function () {
        $scope.show_setFile = !$scope.show_setFile;
    };

    $scope.get_filelist = function () {
        $http.get('/admin/filelist')
            .success(function (json) {
                if(json.success == true){
                    $scope.filelist = json.filelist
                }
            })
    };

    $scope.task = {
        shell : '',
        file : ''
    };

    $scope.$on('get_filename', function (event,data) {
        $scope.task.file = data;
    });

    $scope.newtask = function (datetime) {
        console.log(datetime);
        $http.get('/admin/newtask/'+datetime)
            .success(function (json) {
                if(json.success){
                    console.log(json.success);
                }else{
                    console.log('error msg');
                }
            })
    };

    $scope.checkinput = function (data) {
        console.log('check init');
        console.log(data);
        var length = data.length;
        //if(length == 2){
        //    if(data.match(/\d{2}/)){
        //        console.log('Figure');
        //    }else{
        //        console.log('Error String1');
        //    }
        //}else if(length == 1){
        //    if(data.match(/\*/)){
        //        console.log('This is *');
        //    }else{
        //        console.log('Error String2');
        //    }
        //}else{
        //    console.log('Error String3');
        //}
    };

    $scope.submit = function () {

        var datetime = $scope.date.mon + '-' + $scope.date.day + '-' + $scope.date.week + '-' + $scope.time.hour + '-' + $scope.time.min;

        if(!$scope.show_setFile){
            $http.get('/admin/newtask/' + datetime + '/0/' + $scope.task.shell )
                .success(function (json) {
                    console.log(json.success);
                })
        }else{
            $http.get('/admin/newtask/' + datetime + '/1/' + $scope.task.file )
                .success(function (json) {
                    console.log(json.success);
                })
        }
    }

})
    //.directive('hourlytask', function () {
    //    return {
    //        restrict : 'E',
    //        replace : true,
    //        templateUrl : 'client/views/pages/task/hourlytask.html',
    //    }
    //})
    //.directive('dailytask', function () {
    //    return {
    //        restrict : 'E',
    //        replace : true,
    //        templateUrl : 'client/views/pages/task/dailytask_bp.html',
    //    }
    //})
    //.directive('weeklytask', function () {
    //    return {
    //        restrict : 'E',
    //        replace : true,
    //        templateUrl : 'client/views/pages/task/weeklytask.html',
    //    }
    //})
    //.directive('monthlytask',function(){
    //    return {
    //        restrict : 'E',
    //        replace : true,
    //        templateUrl : 'client/views/pages/task/monthlytask.html',
    //    }
    //})
    //.directive('yearlytask',function(){
    //    return {
    //        restrict : 'E',
    //        replace : true,
    //        templateUrl : 'client/views/pages/task/yearlytask.html',
    //    }
    //});
    //.directive('newtask',function(){
    //    return {
    //        restrict : 'E',
    //        replace : true,
    //        templateUrl : 'client/views/pages/task/newtask.html'
    //    }
    //});

//dailytask.controller('hourlytask', function ($scope,$http) {
//
//    $scope.time = {
//        min : 0
//    };
//    $scope.task = {
//        shell : '',
//        file : ''
//    };
//
//    $scope.$on('get_filename', function (event,data) {
//        $scope.task.file = data;
//    });
//
//    $scope.submit = function () {
//        if(!$scope.show_setFile){
//            $http.get('/admin/newhourlytask/' + $scope.time.min + '/0/' + $scope.task.shell )
//                .success(function (json) {
//                    console.log(json.success);
//                })
//        }else{
//            $http.get('/admin/newhourlytask/' + $scope.time.min + '/1/' + $scope.task.file )
//                .success(function (json) {
//                    console.log(json.success);
//                })
//        }
//
//    }
//});
//
//dailytask.controller('dailytask', function ($scope,$http) {
//
//    $scope.time = {
//        hour : 0,
//        min : 0,
//    };
//
//    $scope.task = {
//        shell : '',
//        file : ''
//    };
//    $scope.$on('get_filename', function (event,data) {
//        $scope.task.file = data;
//    });
//
//    $scope.submit = function () {
//        if(!$scope.show_setFile){
//            $http.get('/admin/newdailytask/' + $scope.time.hour + '/' + $scope.time.min + '/0/' + $scope.task.shell)
//                .success(function (json) {
//                    console.log(json.success);
//                })
//        }else{
//            $http.get('/admin/newdailytask/' + $scope.time.hour + '/' + $scope.time.min + '/0/' + $scope.task.file)
//                .success(function (json) {
//                    console.log(json.success);
//                })
//        }
//    }
//});
//
//dailytask.controller('weeklytask', function ($scope,$http) {
//
//    $scope.weekday = 0;
//    $scope.hour = 0;
//    $scope.min = 0;
//
//    $scope.task = {
//        shell : '',
//        file : ''
//    };
//    $scope.$on('get_filename', function (event,data) {
//        $scope.task.file = data;
//    });
//
//
//    $scope.submit = function () {
//        if(!$scope.show_setFile){
//            $http.get('/admin/newweeklytask/' + $scope.weekday + '/' + $scope.hour + '/' + $scope.min + '/0/' + $scope.task.shell)
//                .success(function (json) {
//                    console.log(json.success);
//                })
//        }else{
//            $http.get('/admin/newweeklytask/' + $scope.weekday + '/' + $scope.hour + '/' + $scope.min + '/0/' + $scope.task.file)
//                .success(function (json) {
//                    console.log(json.success);
//                })
//        }
//    }
//})
//    .filter('toWeekday',function(){
//        return function(num){
//            if(num == 0){
//                return 'Sun';
//            }if(num == 1){
//                return 'Mon';
//            }if(num == 2){
//                return 'Tue';
//            }if(num == 3){
//                return 'Web';
//            }if(num == 4){
//                return 'Thu';
//            }if(num == 5){
//                return 'Fri';
//            }if(num == 6){
//                return 'Sat';
//            }
//        }
//    });
//
//dailytask.controller('monthlytask', function ($scope,$http) {
//
//    $scope.date = {
//        day : 1,
//    };
//    $scope.time = {
//        hour : 0,
//        min : 0,
//    };
//
//    $scope.task = {
//        shell : '',
//        file : ''
//    };
//    $scope.$on('get_filename', function (event,data) {
//        $scope.task.file = data;
//    });
//
//    $scope.submit = function () {
//        if(!$scope.show_setFile){
//            $http.get('/admin/newmonthlytask/'+$scope.date.day+'/'+$scope.time.hour+'/'+$scope.time.min + '/0/' + $scope.task.shell)
//                .success(function (json) {
//                    console.log(json.success);
//                })
//        }else{
//            $http.get('/admin/newmonthlytask/'+$scope.date.day+'/'+$scope.time.hour+'/'+$scope.time.min + '/0/' + $scope.task.file)
//                .success(function (json) {
//                    console.log(json.success);
//                })
//        }
//    }
//});
//
//dailytask.controller('yearlytask', function ($scope,$http) {
//
//
//    $scope.date = {
//        day : 1,
//        mon : 1
//    };
//    $scope.time = {
//        hour : 0,
//        min : 0,
//    };
//
//    $scope.task = {
//        shell : '',
//        file : ''
//    };
//    $scope.$on('get_filename', function (event,data) {
//        $scope.task.file = data;
//    });
//
//    $scope.submit = function () {
//        if(!$scope.show_setFile){
//            $http.get('/admin/newyearlytask/'+$scope.date.mon+'/'+$scope.date.day+'/'+$scope.time.hour+'/'+$scope.time.min + '/0/' + $scope.task.shell)
//                .success(function (json) {
//                    console.log(json.success);
//                })
//        }else{
//            $http.get('/admin/newyearlytask/'+$scope.date.mon+'/'+$scope.date.day+'/'+$scope.time.hour+'/'+$scope.time.min + '/0/' + $scope.task.file)
//                .success(function (json) {
//                    console.log(json.success);
//                })
//        }
//    }
//})
//    .filter('toMonth', function () {
//        return function (num) {
//            if(num == 1){
//                return 'Jan';
//            }if(num == 2){
//                return 'Feb';
//            }if(num == 3){
//                return 'Mar';
//            }if(num == 4){
//                return 'Apr';
//            }if(num == 5){
//                return 'May';
//            }if(num == 6){
//                return 'Jun';
//            }if(num == 7){
//                return 'Jul';
//            }if(num == 8){
//                return 'Aug';
//            }if(num == 9){
//                return 'Sep';
//            }if(num == 10){
//                return 'Oct';
//            }if(num == 11){
//                return 'Nov';
//            }if(num == 12){
//                return 'Dev';
//            }
//        }
//    });

var current = angular.module('current',['ui.bootstrap']);
current.controller('currentController', function ($scope,$http) {

    $scope.maxSize = 10;
    $scope.bigCurrentPage = 1;
    $scope.sort = {
        sort : '',
        sign : ''
    };

    $http.get('/admin/currentOp')
        .success(function (json) {
            $scope.dataList = json.data;
            $scope.bigTotalItems = $scope.dataList.length;
            $scope.data = $scope.dataList.slice(0,10)
        });

    $scope.$watch('bigCurrentPage', function () {
        if($scope.dataList){
            $scope.data = $scope.dataList.slice(($scope.bigCurrentPage-1)*10,($scope.bigCurrentPage-1)*10+10)
        }
    });

    $scope.change_sort = function (sort) {
        $scope.sort.sort = sort;
        $scope.sort.sign = !$scope.sort.sign;
        $scope.bigCurrentPage = 1;
        $scope.dataList = $scope.dataList.sort(function (a,b) {
            if($scope.sort.sort == 'ns'){
                if($scope.sort.sign){
                    return a[$scope.sort.sort] > b[$scope.sort.sort];
                }
                return a[$scope.sort.sort] < b[$scope.sort.sort];
            }else{
                if($scope.sort.sign){
                    return a[$scope.sort.sort] - b[$scope.sort.sort];
                }
                return b[$scope.sort.sort] - a[$scope.sort.sort];
            }
        });
        $scope.data = $scope.dataList.slice(($scope.bigCurrentPage-1)*10,($scope.bigCurrentPage-1)*10+10)
    }
})
    .directive('currentopDetail',function(){
        return {
            restrict : 'E',
            replace : true,
            templateUrl : 'client/views/pages/admin_views/detailModal.html'
        }
    });