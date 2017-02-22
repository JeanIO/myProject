

angular.module('myFilter',[])
  .filter('getLocation', ['$filter',function ($filter) {
    console.log(arguments);
    return "";
  }])
.filter('showCourseStatus', ['$filter', function ($filter) {
    return function (value) {
        if (value == 1) {
            return '未审核';
        } else {
            return "已审核"
        }
    }
}])
    .filter('showUserStatus', ['$filter', function ($filter) {
        return function (value) {
            if (value == 4) {
                return '启用';
            } else if (value==8){
                return "禁用";
            }
        }
    }])