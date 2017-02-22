/**
 * Created by mirage9920 on 2016/7/4.
 */

angular.module('service',['ngResource'])
       // return $http({method:'post',url:URL});
         // return $http.get("https://api.hylaa.com/course/list");

//    sendData.events(URL,pData).success(function(response){
//            $scope.XXXXXX=response.XXXXXX;
//          });  调用
.factory('postData',['$http','$state','$rootScope','$q','localStorageService', function($http, $state,$rootScope,$q, localStorageService){
  
    return {
        postService:function(url,data){
            data.body.admin_id=localStorageService.get('adminId');
            var transFunc = function (data) {
                    return $.param(data);
                },
                postCfg = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                        'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                    },
                    transformRequest: transFunc
                };
            var delay=$q.defer();
            $http.post(url,data,postCfg).success(function (res) {
                delay.resolve(res);
            }).error(function (res) {
                bootbox.alert(res.error.message);
                $rootScope.loading = false;
                delay.reject(res);
            });
            return delay.promise;
        }
        }

}])
    .factory('fileReader', ["$q", "$log", function($q, $log){
        var onLoad = function(reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.resolve(reader.result);
                });
            };
        };
        var onError = function (reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.reject(reader.result);
                });
            };
        };
        var getReader = function(deferred, scope) {
            var reader = new FileReader();
            reader.onload = onLoad(reader, deferred, scope);
            reader.onerror = onError(reader, deferred, scope);
            return reader;
        };
        var readAsDataURL = function (file, scope) {
            var deferred = $q.defer();
            var reader = getReader(deferred, scope);
            reader.readAsDataURL(file);
            return deferred.promise;
        };
        return {
            readAsDataUrl: readAsDataURL
        };
    }])
.factory('userList',['$q','$http','$rootScope',function($q,$http,$rootScope){
return {
    query:function(){
    var pData1=new Object();
    var serialData=new Object();
    serialData.pagesize=3;
    serialData.page=1;
    serialData.admin_id=$rootScope.adminId;
    pData1.body=serialData;
    var url1 = 'https://api.hylaa.com/admin/user/list',
        data1 = pData1;
    transFn1 = function(data) {
        return $.param(data);
    },
        postCfg1 = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                // 'Authorization' :'Bearer 9Db74l4OR7cTsX5hG89WTnkzA6vVHQzGjR6g8bl1'
            },
            transformRequest: transFn1
        };

    var delay=$q.defer();

    $http.post(url1, data1, postCfg1).success(
        function(res){
            delay.resolve(res);
        }).error(function(){
            delay.reject('');
        });

    return delay.promise;
    }
};

}])
//loading
    .factory('timestampMarker', ["$rootScope", function ($rootScope) {
    var timestampMarker = {
        request: function (config) {
            $rootScope.loading = true;
            config.requestTimestamp = new Date().getTime();
            return config;
        },
        response: function (response) {
            $rootScope.loading = false;
            response.config.responseTimestamp = new Date().getTime();
            return response;
        }
    };
    return timestampMarker;
}]);

