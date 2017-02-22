/**
 * Created by huangzhibiao on 16/5/31.
 */
'use strict';


angular.module('directive',['service']).directive('uploadImage', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs, ngModel) {
      var model = $parse(attrs.uploadImage);
      var modelSetter = model.assign;
      element.bind('change', function(event){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
        });
        //附件预览
        if (!element[0].multiple) {
          scope.file = (event.srcElement || event.target).files[0];
        } else {
          scope.file_list = (event.srcElement || event.target).files;
        }
        scope.getFile(attrs.id);
      });
    }
  };
}])
.directive('newUploadImage', ['$parse','fileReader', function ($parse,fileReader) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs, ngModel) {
     // var model = $parse(attrs.uploadImage);
     // var modelSetter = model.assign;
      element.bind('change', function(event){

      //  scope.$apply(function(){
      //    modelSetter(scope, element[0].files[0]);
     //   });
        scope.file = (event.srcElement || event.target).files[0];
        fileReader.readAsDataUrl(scope.file, scope)
            .then(function(result) {

if(element.siblings('img').length>0){

  element.siblings('img').attr('src',result);
  element.parent().siblings('h3').find('i').bind('click',function(){
    element.siblings('img').removeAttr('src');
    scope.imgExists=false;
  });

  scope.imgExists=true;
}//新增弹出框中的input
              else{
  element.parent().siblings('img').attr('src',result);

}//普通框中的input
            });
      });
    }
  };
}])
    .directive('butterbar',['$rootScope',function($rootScope){
      return{
        link:function(scope,element,attrs){
          element.addClass('hide');
          $rootScope.$on('',function(){
            element.removeClass('hide');
          });
          $rootScope.$on('',function(){
            element.addClass('hide');
          });
        }
      };
    }])
    .directive('pagination', function() {
      return {
        restrict: 'E',
        scope: {
          numPages: '=',
          currentPage: '=',
          onSelectPage: '&'
        },
        template: '<div class="pagination"><ul>'+
       ' <li ng-class="{disabled: noPrevious()}"><a ng-click="selectPrevious()">Previous</a></li>'+
           ' <li ng-repeat="page in pages" ng-class="{active: isActive(page)}"><a ng-click="selectPage(page)">{{page}}</a></li>'+
      '<li ng-class="{disabled: noNext()}"><a ng-click="selectNext()">Next</a></li></ul></div>',
        replace: true,
        link: function(scope) {   
          scope.$watch('numPages', function(value) {
            scope.pages = [];
            for(var i=1;i<=value;i++) {
              scope.pages.push(i);
            }
            if ( scope.currentPage > value ) {
              scope.selectPage(value);
            }
          });
          scope.noPrevious = function() {
            return scope.currentPage === 1;
          };
          scope.noNext = function() {
            return scope.currentPage === scope.numPages;
          };
          scope.isActive = function(page) {
            return scope.currentPage === page;
          };

          scope.selectPage = function(page) {
            if ( ! scope.isActive(page) ) {
              scope.currentPage = page;
              scope.onSelectPage({ page: page });
            }
          };

          scope.selectPrevious = function() {
            if ( !scope.noPrevious() ) {
              scope.selectPage(scope.currentPage-1);
            }
          };
          scope.selectNext = function() {
            if ( !scope.noNext() ) {
              scope.selectPage(scope.currentPage+1);
            }
          };
        }
      };
    })
    .directive('edit', function(){
      return{
        restrict: 'AE',
        require: 'ngModel',
        link: function(scope,element,attrs,ngModel){
          element.bind("click",function(){
            var id = "item_" +ngModel.$modelValue.id;
            var obj = $("#"+id);
            obj.removeAttr("readOnly");
            scope.$apply(function(){
              scope.showEdit = false;
              scope.showCancel = true;
              scope.showUpdate = true;
              scope.showDelete = true;
            })
          });
        }
      }
    })
    .directive("update",function(){
      return{
        restrict: 'AE',
        require: 'ngModel',
        link: function(scope,element,attrs,ngModel){
          element.bind("click",function(){
            var id = "item_" +ngModel.$modelValue.id;
            var obj = $("#"+id);
            obj.attr("readOnly",true);
            scope.$apply(function(){
              scope.showEdit = true;
              scope.showCancel=false;
              scope.showUpdate = false;
              scope.showDelete = false;
            })
            scope.update(ngModel.$modelValue);
          })
        }
      }
    })
    .directive("cancel",function(){
      return{
        restrict: 'AE',
        require: 'ngModel',
        link: function(scope,element,attrs,ngModel){
          element.bind("click",function(){
            var id = "item_" +ngModel.$modelValue.id;
            var obj = $("#"+id);
            obj.prop("readOnly",true);
            scope.$apply(function(){
              scope.showEdit = true;
              scope.showCancel = false;
              scope.showUpdate = false;
              scope.showDelete = false;
            })
          })
        }
      }
    })
    .directive("delete",function(){
      return{
        restrict: 'AE',
        require: 'ngModel',
        link: function(scope,element,attrs,ngModel){
          element.bind("click",function(){
            var id = "item_" +ngModel.$modelValue.id;
            var obj = $("#"+id);
            obj.prop("readOnly",true);
            scope.$apply(function(){
              scope.showEdit = true;
              scope.showCancel = false;
              scope.showUpdate = false;
              scope.showDelete = false;
            })
            scope.delete(ngModel.$modelValue);
          })
        }
      }
    });

    



