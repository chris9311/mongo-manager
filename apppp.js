var app = angular.module('app2',['ui.bootstrap']);
app.controller('appcon', function ($scope) {
   $scope.dt = new Date();
});