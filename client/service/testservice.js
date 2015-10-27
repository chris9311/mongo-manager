/**
 * Created by HUANGCH4 on 2015/9/1.
 */
var Service = angular.module('service_test',[]);
Service.factory('mytest',function(){
   return {
       test : function(){
           alert('sss');
       }
   }
});