angular.module('controller',['service','directive','ui.router','LocalStorageModule'])
  
    .controller('indexController',['$scope','$rootScope','localStorageService','$state',function($scope,$rootScope,localStorageService,$state){

        if(localStorageService.get('accessToken')){
            localStorageService.set('isLogin',true);
        }
        else{
            localStorageService.set('isLogin',false);
        }

        $rootScope.isLogin=localStorageService.get('isLogin');



        $scope.logout=function(){
            bootbox.confirm("确定退出吗?",function(result){
                if(result){
                    bootbox.alert("退出成功",function(){
                        localStorageService.clearAll();
                        $rootScope.isLogin=localStorageService.get('isLogin');
                        $state.go('login');
                    });

                }
            });
        }
    }])
    
   //课程列表页
    .controller('lessonInfoController',['courseList','$rootScope','$scope','fileReader','$state','postData','localStorageService', function(courseList,$rootScope,$scope,fileReader,$state,postData,localStorageService){

        $scope.orderBy = 'cost_price';
        $scope.lessons=courseList.body.course_list;
        $scope.pagesize = 12;
        $scope.page_num = courseList.body.page_num;
        $scope.page = 1;

        $scope.selectPage = function (page) {
            postData.postService('https://api.hylaa.com/admin/course/list', {body:{
                pagesize : $scope.pagesize,
                page : page
            }}).then(function (res) {
                $scope.lessons = res.body.course_list;
            })
        };

        // $scope.$watch('page', $scope.setPage );


        $scope.check = function (lesson) {

            if (lesson.status == 1) {
                lesson.status = 2;
            } else {
                lesson.status = 1;
            }
            var url = 'https://api.hylaa.com/admin/course/status',
                data = {
                    body : {
                        course_id : lesson.id,
                        admin_id : localStorageService.get('adminId')
                    },

                }, transFn = function(data) {
                    return $.param(data);
                },
                postCfg = {
                    headers: {
                        'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                        'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                        //'Date':new Date().toString(),
                    },
                    transformRequest: transFn,
                    withCredentials:true,
                };
            postData.postService(url, data).then(function (res) {
                bootbox.alert('修改成功');
                $state.reload();
            })
        }

        $scope.recommend = function (lesson) {
            var url = 'https://api.hylaa.com/admin/recommend/set',
                data = {body : {
                    recommend_type : 1,
                    recommend_id : lesson.id
                }};
            postData.postService(url, data).then(function (res) {
                console.log(res);
                bootbox.alert('修改成功.');
                $state.reload();
            })
        }
        $scope.remove = function (lesson) {
                bootbox.confirm("确定删除该课程",function(result){
                    if(result){

                        var url = 'https://api.hylaa.com/admin/course/delete',
                            data = {
                                body : {
                                    course_id : lesson.id,
                                }
                            };
                        postData.postService(url, data).then(function (res) {
                            bootbox.alert('修改成功');
                            $state.reload();
                        })
                    }
                });
        }

}])


   //课程详情
    .controller('lessonDetailController',['course','teacherList','lessonTypeList','localStorageService', '$scope','$state','$stateParams','$http', 'fileReader',function(course,teacherList,lessonTypeList,localStorageService,$scope,$state,$stateParams, $http, fileReader){

        $scope.lessonTimeArray = [];
        var timeRangeList = ['9:00-10:00','10:00-11:00','11:00-12:00','12:00-13:00','13:00-14:00','14:00-15:00','15:00-16:00','16:00-17:00','17:00-18:00','18:00-19:00','19:00-20:00','20:00-21:00'];
        for(var i=0; i<12;i++) {
            $scope.lessonTimeArray.push({
                timeRange: timeRangeList[i],
                day1 : 'selectable', day2 : 'selectable', day3 : 'selectable', day4 : 'selectable', day5 : 'selectable', day6 : 'selectable', day7 : 'selectable'
            })
        }

        $scope.selectTime = function (index, dayIndex) {
            var type = $scope.lessonTimeArray[index]['day'+dayIndex];
            if (type !== 'hasSelected') {
                $scope.lessonTimeArray[index]['day'+dayIndex] = 'hasSelected';
            }
            else {
                $scope.lessonTimeArray[index]['day'+dayIndex] = 'selectable';
                loadTeacherFreetime($scope.selectedTeacher);
            }
        };
        $scope.teachers = teacherList.body;
        $scope.course = course.body;
        $scope.course.type = $scope.course.type;
        findSelectedTeacher($scope.course.teacher_id);
        loadTeacherFreetime($scope.selectedTeacher);
        loadClassTime();
        function findSelectedTeacher(teacher_id) {
            var selectedTeacher = {};
            for(var i=0; i<$scope.teachers.length;i++) {
                if (teacher_id == $scope.teachers[i].user_id) {
                    selectedTeacher = $scope.teachers[i];
                    break;
                }
            }
            $scope.selectedTeacher = selectedTeacher;
        }
        function loadClassTime() {
            if ($scope.course.class_time && $scope.course.class_time.length>0) {
                for(var i=0; i<$scope.course.class_time.length;i++) {
                    var day = $scope.course.class_time[i].day*1;
                    var time = $scope.course.class_time[i].time*1-1;
                    $scope.lessonTimeArray[time]['day'+day] = 'hasSelected';
                }
            }
        }

        function loadTeacherFreetime(selectedTeacher) {
            if (selectedTeacher.free_time) {
                var freeTime = selectedTeacher.free_time.split('#');//free_time :"0102#0305#0207#0309"
                for(var j=0;j<freeTime.length;j++) {
                    var day = freeTime[j].substring(0,2)*1;
                    var time = freeTime[j].substring(2,2)*1;//to Int
                    if ($scope.lessonTimeArray[time]['day'+day] == 'hasSelected') continue;
                    $scope.lessonTimeArray[time]['day'+day] = 'teacherFree';
                }
            }
        }

        $scope.selectTeacher = function(id) {
            findSelectedTeacher(id);
            var selectedTeacher = $scope.selectedTeacher;
            if (selectedTeacher.free_time) {
                loadTeacherFreetime(selectedTeacher);
            } else {
                $scope.lessonTimeArray.forEach(function (lessonTime) {
                    for(var k=1;k<8;k++) {
                        lessonTime['day'+k] = 'selectable';
                    }
                })
                loadClassTime();
            }

        }

        $scope.lessonTypes = lessonTypeList.body;

        $scope.getFile = function () {
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function(result) {
                    $scope.file=result;
                    $scope.course.image = result;
                });
        };

        $scope.createCourse = function() {
        bootbox.confirm('确认提交更改' ,function (result) {
            if (result) {
                var class_time = [];
                for(var i=1;i<13;i++) {
                    for(var j=1;j<8;j++) {
                        if  ($scope.lessonTimeArray[i-1]['day'+j] == 'hasSelected') {
                            var lessonTime = {
                                day : '0'+j,
                                time: i<10?('0'+ i) : i
                            };
                            class_time.push(lessonTime);
                        }
                    }
                }
                $scope.course.class_time = class_time;
                var url = 'https://api.hylaa.com/admin/course/create';
                if ($scope.course.id) {
                    url = 'https://api.hylaa.com/admin/course/modify';
                }

                $scope.course.admin_id = localStorageService.get('adminId');
                data = {
                    body: $scope.course,
                    file: $scope.file
                },
                    transFn = function (data) {
                        return $.param(data);
                    },
                    postCfg = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'Authorization': 'Bearer ' + localStorageService.get('accessToken'),
                            'X-GTEDX-Integrity': 'GSign ' + localStorageService.get('accessToken'),
                            //'Date':new Date().toString(),
                        },
                        transformRequest: transFn,
                        withCredentials: true,
                    };
                $http.post(url, data, postCfg).success(function (res) {
                    bootbox.alert('保存成功');
                    $state.go('loginSuccess.lessonInfo');
                }).error(function (data, status) {
                    $state.go('loginSuccess.404', {status: status});
                });
            }
                })

            }

    }])
    .controller('lessonFeedbackController', ['lessonFeedbackList','$scope','postData', function (lessonFeedbackList, $scope, postData) {
        $scope.feedbackList = lessonFeedbackList.body.feedback_list;
        $scope.pagesize = 12;
        $scope.page_num = lessonFeedbackList.body.page_num;
        $scope.page = 1;

        $scope.setPage = function () {
            postData.postService('https://api.hylaa.com/admin/feedback/list', {body : {
                pagesize : $scope.pagesize,
                page : ($scope.page==0 ? 1 : $scope.page)
            }}).then(function (res) {
                $scope.feedbackList = res.body.feedback_list;
            })
        };

        $scope.$watch( 'currentPage', $scope.setPage );

        $scope.checkFeedback = function (feedback) {
            if (feedback.status == '1') {
                    feedback.status = '2';
            } else {
                    feedback.status = '1';
            }
            var url = 'https://api.hylaa.com/admin/feedback/status',
                data = {body : {feedback_id : feedback.feedback_id}};
            postData.postService(url, data).then(function (res) {
                console.log(res);
                bootbox.alert('修改成功。');
            })
        }
        $scope.deleteFeedback = function (feedback) {

        }
    }])
    .controller('feedbackDetailController', ['feedbackDetail','$scope', 'postData', function (feedbackDetail, $scope, postData) {
        $scope.feedbackDetail = feedbackDetail.body;
    }])



   //课程首页
    .controller('lessonHomepageController',['localStorageService','response','$rootScope','$scope','$http','$state',function(localStorageService,response,$rootScope,$scope,$http,$state){

        $scope.hover=false;
        $scope.imgs=response.data.body;
        $scope.notForbidImgs=[];
        angular.forEach($scope.imgs,function(img){
            if(img.status==2){
                img.forbid=false;
                $scope.notForbidImgs.push({
                    src: img.image_url,
                    title: img.title,
                });

            }
            else if(img.status==1){
                img.forbid=true;

            }
        });
        $scope.addSlide = function(img,amount) {
            $scope.currIndex = 0;
            $scope.slides = [];
            for (var i = 0; i < amount; i++) {
                $scope.slides.push({
                    src: img[i].src,
                    title: img[i].title,
                    id: $scope.currIndex++,
                });
            }
        };
        $scope.addSlide($scope.notForbidImgs,$scope.notForbidImgs.length);


        $scope.edit=function(img,index){
                bootbox.confirm("确定提交修改吗?",function(result){
                    if(result){
                        var pData1=new Object();
                        var serialData=new Object();
                        serialData.id=img.id;
                        serialData.title=img.title;
                        serialData.jumping_url=img.jumping_url;
                        serialData.image_to=1;
                        serialData.admin_id=localStorageService.get('adminId');
                        pData1.body=serialData;
                        number=index+1;
                        pData1.file=$('#lessonCarousel'+number).attr('src');
                        var url1 = 'https://api.hylaa.com/admin/image/modify',
                            data1 = pData1;
                        transFn1 = function(data) {
                            return $.param(data);
                        },
                            postCfg1 = {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                     'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                    //'Date':new Date().toString(),
                                },
                                transformRequest: transFn1,
                                withCredentials:true,
                            };
                        $http.post(url1, data1, postCfg1).success(function(){
                            bootbox.alert("修改成功");
                            $state.reload();
                        }).error(function(data,status){
                            var returnMes=new Object();
                            returnMes.status=status;
                            returnMes.message=data.error.message;
                            $state.go('loginSuccess.404',{returnMes:returnMes});
                        });
                    }
                    else{
                        $state.reload();
                    }
                });

        };



        $scope.carousel=false;
        $scope.showCarousel=function(){
            $rootScope.dialog=true;
            $scope.showLessonCarouselDialog=true;
        };
        $scope.cancelLessonCarouselDialog=function(){
            $rootScope.dialog=false;
            $scope.showLessonCarouselDialog=false;
        }
        $scope.remove=function(img){
            bootbox.confirm("确定删除轮播图吗?",function(result){
                if(result){
                    var pData1=new Object();
                    var serialData=new Object();
                    serialData.id=img.id;
                    serialData.admin_id=localStorageService.get('adminId');
                    pData1.body=serialData;
                    var url1 = 'https://api.hylaa.com/admin/image/delete',
                        data1 = pData1;
                    transFn1 = function(data) {
                        return $.param(data);
                    },
                        postCfg1 = {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                //'Date':new Date().toString(),
                            },
                            transformRequest: transFn1,
                            withCredentials:true,
                        };
                    $http.post(url1, data1, postCfg1).success(function(){
                        bootbox.alert("删除成功");
                        $state.reload();
                    }).error(function(data,status){
                        var returnMes=new Object();
                        returnMes.status=status;
                        returnMes.message=data.error.message;
                        $state.go('loginSuccess.404',{returnMes:returnMes});
                    });
                }
            });
        };
        $scope.forbidOrNot=function(img){
            if(img.forbid){
                bootbox.confirm("确定禁用该轮播图吗?",function(result){
                    if(result){
                        img.status=1;
                        var pData1=new Object();
                        var serialData=new Object();
                        serialData.id=img.id;
                        serialData.admin_id=localStorageService.get('adminId');
                        pData1.body=serialData;
                        var url1 = 'https://api.hylaa.com/admin/image/status',
                            data1 = pData1;
                        transFn1 = function(data) {
                            return $.param(data);
                        },
                            postCfg1 = {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                    'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                    //'Date':new Date().toString(),
                                },
                                transformRequest: transFn1,
                                withCredentials:true,
                            };
                        $http.post(url1, data1, postCfg1).success(function(){
                            bootbox.alert("禁用成功");
                            $state.reload();
                        }).error(function(data,status){
                            var returnMes=new Object();
                            returnMes.status=status;
                            returnMes.message=data.error.message;
                            $state.go('loginSuccess.404',{returnMes:returnMes});
                        });
                    }
                });
            }
            else{
                bootbox.confirm("确定启用该轮播图吗?",function(result){
                    if(result){
                        img.status=2;
                        var pData1=new Object();
                        var serialData=new Object();
                        serialData.id=img.id;
                        serialData.admin_id=localStorageService.get('adminId');
                        pData1.body=serialData;
                        var url1 = 'https://api.hylaa.com/admin/image/status',
                            data1 = pData1;
                        transFn1 = function(data) {
                            return $.param(data);
                        },
                            postCfg1 = {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                    'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                    //'Date':new Date().toString(),
                                   
                                },
                                transformRequest: transFn1,
                                withCredentials:true,
                            };
                        $http.post(url1, data1, postCfg1).success(function(){
                            bootbox.alert("启用成功");
                            $state.reload();
                        }).error(function(data,status){
                            var returnMes=new Object();
                            returnMes.status=status;
                            returnMes.message=data.error.message;
                            $state.go('loginSuccess.404',{returnMes:returnMes});
                        });

                    }

                });

            }
        };
        $scope.addImage=function(){
            $rootScope.dialog=true;
            $scope.addImageDialog=true;
        }
        $scope.newImage={title:'',jumping_url:'',image_url:''};
        $scope.hover=false;
        $rootScope.dialog=false;
        $scope.addImageDialog=false;
        $scope.imgExists=false;
        $scope.cancelAddImageDialog=function(){
            $rootScope.dialog=false;
            $scope.addImageDialog=false;
            

        };
        $scope.submitAddImageDialog=function(){
            var pData1=new Object();
            var serialData=new Object();
            $scope.newImage.image_url=$("#newImage1").attr('src');

            serialData.title=$scope.newImage.title;
    
            serialData.jumping_url=$scope.newImage.jumping_url;
            serialData.image_to=1;
            serialData.admin_id=localStorageService.get('adminId');
            pData1.body=serialData;
            pData1.file=$scope.newImage.image_url;
            var url1 = 'https://api.hylaa.com/admin/image/create',
                data1 = pData1;
            transFn1 = function(data) {
                return $.param(data);
            },
                postCfg1 = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                        'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                        //'Date':new Date().toString(),

                      
                    },
                    transformRequest: transFn1,
                    withCredentials:true,
                };
            $http.post(url1, data1, postCfg1).success(function(){
                $rootScope.dialog=false;
                $scope.addImageDialog=false;
                $state.reload();
            }).error(function(data,status){
                var returnMes=new Object();
                returnMes.status=status;
                returnMes.message=data.error.message;
                $state.go('loginSuccess.404',{returnMes:returnMes});
            });


        };
    }])

    //乐器列表
    .controller('instrumentInfoController',['instrumentList','$scope','$rootScope','fileReader','$state','postData',function (instrumentList,$scope,$rootScope,fileReader,$state,postData) {


        $scope.orderBy = 'cost_price';
        $scope.instruments = instrumentList.body.instrument_list;
        $scope.pagesize = 12;
        $scope.page_num = instrumentList.body.page_num;
        $scope.page = 1;

        $scope.setPage = function () {
            postData.postService('https://api.hylaa.com/admin/instrument/list', {body : {
                pagesize : $scope.pagesize,
                page : ($scope.page==0 ? 1 : $scope.page)
            }}).then(function (res) {
                $scope.instruments = res.body.instrument_list;
            })
        };

        $scope.$watch( 'page', $scope.setPage );

        $scope.recommend = function (instrument) {
            instrument.recommend = (instrument.recommend=='1' ? '0' : '1');
            var url = 'https://api.hylaa.com/admin/recommend/set',
                data = {body : {
                    recommend_type : 2,
                    recommend_id : instrument.id
                }};
            postData.postService(url, data).then(function (res) {
                console.log(res);
                bootbox.alert('修改成功.');
            })
        }

        $scope.removeInstrument = function (id) {
            bootbox.confirm('确认删除 ？' ,function (result) {
                if (result) {
                    var url = 'https://api.hylaa.com/admin/instrument/delete',
                        data = {
                            body : { instrument_id : id}};
                    postData.postService(url, data).then(function (res) {
                        bootbox.alert('删除成功!');
                        for (var i=0; i<$scope.instruments.length; i++) {
                            if ($scope.instruments[i].id == id) {
                                $scope.instruments.splice(i,1);
                            }
                        }
                    })
                }

            })
        }

    }])
    
 //乐器详情   
.controller('instrumentDetailController',['instrument','instrumentTypeList','postData','$scope','fileReader','$state',function(instrument,instrumentTypeList,postData,$scope,fileReader,$state){

    $scope.instrument = instrument;
   // $scope.instrument.type = parseInt($scope.instrument.type);//add this when instrumentTypeList's id from server is int
    if (!$scope.instrument.property_list) {
        $scope.instrument.property_list = [];
    }
    if (!$scope.instrument.parameter) {
        $scope.instrument.parameter = [];
    }
    $scope.instrumentTypeList = instrumentTypeList.body;

    // $scope.args=[];
    // if ($scope.instrument.parameter) {
    //     $scope.instrument.parameter.forEach(function (p) {
    //         $scope.args.push({
    //             key : p.split(':')[0],
    //             value : p.split(':')[1]
    //         })
    //     })
    // }

    $scope.removeArg = function (index) {
        $scope.instrument.parameter.splice(index, 1);
    };

    $scope.addArg=function(){
        $scope.instrument.parameter.push('');
    };

    $scope.addProperty = function () {
        $scope.instrument.property_list.push({
            id : $scope.instrument.property_list.length +1 + 'new',
            stock : '',
            price : $scope.instrument.cost_price,
            property_name : '',
            property_desc : ''
        })
    };
    $scope.removeProperty = function (index) {
        $scope.instrument.property_list.splice(index, 1);
    }

    $scope.getFile = function(attrId) {
        if (attrId == 'image_display') {
            fileReader.readAsDataUrl($scope.image_display, $scope)
                .then(function(result) {
                    $scope.file = result;
                  $scope.instrument.image_display = result;
                })
        } else if (attrId == 'image_all'){
            $scope.files = [];
            $scope.instrument.image_all= [];
            for (var i=0; i<$scope.file_list.length; i++) {
                fileReader.readAsDataUrl($scope.file_list[i],$scope)
                    .then(function (result) {
                        $scope.files.push(result);
                        $scope.instrument.image_all.push(result);
                    })
            }
        }
    };

    $scope.createInstrument = function () {
        bootbox.confirm('确认提交更改' ,function (result) {
            if (result) {
                console.log('submitted');

                var url = 'https://api.hylaa.com/admin/instrument/create';
                if ($scope.instrument.id) {
                    url = 'https://api.hylaa.com/admin/instrument/modify';
                }
                $scope.instrument.image_display = '';
                $scope.instrument.image_all = [];
                data = {body : $scope.instrument,
                    file : $scope.file,
                    file_list : $scope.files
                    },
                    transFn = function(data) {
                        return $.param(data);
                    },
                    postCfg = {
                        headers: {
                            'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                            // 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            // 'Authorization' :'Bearer 9Db74l4OR7cTsX5hG89WTnkzA6vVHQzGjR6g8bl1'
                        },
                        transformRequest: transFn,
                    };
                postData.postService(url, data).then(function (res) {
                    console.log(res);
                    bootbox.alert('保存成功');
                    $state.go('loginSuccess.instrumentInfo');
                })
            }
        })
    }
}])
    //学生签到情况
    .controller('signInInfoController', ['signInInfoList','$scope', 'postData', function (signInInfoList,$scope, postData) {
        $scope.signInInfoList = signInInfoList.body.user_class;
        $scope.pagesize = 10;
        $scope.page_num = signInInfoList.body.page_num;
        $scope.page = 1;

        $scope.selectPage = function (page) {
            postData.postService('https://api.hylaa.com/admin/course/register', {body:{
                date : $scope.dt ? $scope.dt : new Date(),
                pagesize : $scope.pagesize,
                page : page==0 ? 1 : page
            }}).then(function (res) {
                $scope.signInInfoList = res.body.user_class;
                $scope.page_num = res.body.page_num;
            })
        };

        // $scope.$watch('page', $scope.setPage );
        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function() {
            $scope.dt = null;
        };

        $scope.inlineOptions = {
            minDate: new Date(),
            showWeeks: false
        };
        $scope.dateOptions = {
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1,
            showWeeks: false
        };
        $scope.popup2 = {
            opened: false
        };
        $scope.open2 = function() {
            $scope.popup2.opened = true;
        };
        $scope.search = function () {
            var date = $scope.dt ? $scope.dt : new Date();
            var data = {
                body : {
                    pagesize : '10',
                    page : '1',
                    date : date
                }
            },
                url = 'https://api.hylaa.com/admin/course/register';
            postData.postService(url, data).then(function (res) {
                $scope.signInInfoList = res.body.user_class;
                $scope.page_num = res.body.page_num
            })
        }

    }])
//课程分类
    .controller('lessonTypeController', ['lessonTypeList', '$scope','postData', '$state',function (lessonTypeList, $scope, postData,$state) {
        $scope.lessonTypes = lessonTypeList.body;
        $scope.remove = function (lessonType) {
            bootbox.confirm("确定删除该课程分类",function(result){
                if(result){
                    var url = 'https://api.hylaa.com/admin/courseType/delete',
                        data = {
                            body : {
                                id : lessonType.id,
                            }
                        };
                    postData.postService(url, data).then(function (res) {
                        bootbox.alert('删除成功');
                        $state.reload();
                    })
                }
            });
        }
        
    }])
    .controller('editLessonTypeController', ['lessonType', '$scope','postData','fileReader', '$state',function(lessonType, $scope, postData,fileReader,$state) {
        $scope.lessonType = lessonType.body;

        $scope.getFile = function () {
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function(result) {
                    $scope.file=result;
                    $scope.lessonType.url = result;
                });
        };

        $scope.createCourseType = function () {
            bootbox.confirm('确认提交更改' ,function (result) {
                if (result) {

                    var url = 'https://api.hylaa.com/admin/courseType/create';
                    if ($scope.lessonType.id) {
                        url = 'https://api.hylaa.com/admin/courseType/modify';
                    }
                    if ($scope.file) {
                        $scope.lessonType.url = null;//avoid to upload image twice
                    }
                    data = {
                        body: $scope.lessonType,
                        file: $scope.file
                    };
                    postData.postService(url,data).then(function (res) {
                        bootbox.alert('保存成功');
                        $state.go('loginSuccess.lessonType');
                    });

                }
            })
        }

    }])
//乐器分类
.controller('instrumentClassifyController',['instrumentTypeList','$scope','postData',function(instrumentTypeList,$scope,postData){


    $scope.instrumentTypeList = instrumentTypeList.body;
    $scope.addClassify=function(){
        $scope.instrumentTypeList.push(
            {
                id : $scope.instrumentTypeList.length+1+'new',
                type_name:''
            });
    };
    $scope.showEdit = true;
    $scope.update = function (record) {
        var url = 'https://api.hylaa.com/admin/instrumentType/modify';
        if(record.id.toString().indexOf('new') > -1) {
            url = 'https://api.hylaa.com/admin/instrumentType/create';
        }

        var data = {
            body : {
                type_name : record.type_name,
                id : record.id
            }
        };
        postData.postService(url, data).then(function (res) {
            bootbox.alert('保存成功！');
        })
    }
    $scope.delete = function (record) {
        var url = 'https://api.hylaa.com/admin/instrumentType/delete';
        for(var i=0;i<$scope.instrumentTypeList.length;i++) {
            if (record.id == $scope.instrumentTypeList[i].id) {
                $scope.instrumentTypeList.splice(i,1);
                break;
            }
        }
        var data = {
            body : {
                id : record.id
            }
        };
        postData.postService(url, data).then(function (res) {
            bootbox.alert('删除成功！');
        })
    }
}])
.controller('agreementController', ['userProtocol','$scope', 'postData', function(userProtocol, $scope, postData) {
    $scope.agreement = userProtocol.body;
    $scope.updateAgreement = function() {
        var url = 'https://api.hylaa.com/admin/agreement/modify',
        data = {
            body : $scope.agreement
        };
        postData.postService(url,data).then(function(res) {
            bootbox.alert('保存成功');
        })
    }
}])


    //乐器首页
    .controller('instrumentHomepageController',['localStorageService','response','$rootScope','$scope','$http','$state',function(localStorageService,response,$rootScope,$scope,$http,$state){

        $scope.hover=false;
        $scope.imgs=response.data.body;
        $scope.notForbidImgs=[];
        angular.forEach($scope.imgs,function(img){
            if(img.status==2){
                img.forbid=false;
                $scope.notForbidImgs.push({
                    src: img.image_url,
                    title: img.title,
                });

            }
            else if(img.status==1){
                img.forbid=true;

            }
        });
        $scope.addSlide = function(img,amount) {
            $scope.currIndex = 0;
            $scope.slides = [];
            for (var i = 0; i < amount; i++) {
                $scope.slides.push({
                    src: img[i].src,
                    title: img[i].title,
                    id: $scope.currIndex++,
                });
            }
        };

        $scope.carousel=false;
        $scope.showCarousel=function(){
            $rootScope.dialog=true;
            $scope.showInstrumentCarouselDialog=true;
        };
        $scope.cancelInstrumentCarouselDialog=function(){
            $rootScope.dialog=false;
            $scope.showInstrumentCarouselDialog=false;
        }
        
        $scope.addSlide($scope.notForbidImgs,$scope.notForbidImgs.length);
        $scope.remove=function(img){
            bootbox.confirm("确定删除轮播图吗?",function(result){
                if(result){
                    var pData1=new Object();
                    var serialData=new Object();
                    serialData.id=img.id;
                    serialData.admin_id=localStorageService.get('adminId');
                    pData1.body=serialData;
                    var url1 = 'https://api.hylaa.com/admin/image/delete',
                        data1 = pData1;
                    transFn1 = function(data) {
                        return $.param(data);
                    },
                        postCfg1 = {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                //'Date':new Date().toString(),
                            },
                            transformRequest: transFn1,
                            withCredentials:true,
                        };
                    $http.post(url1, data1, postCfg1).success(function(){
                        bootbox.alert("删除成功");
                        $state.reload();
                    }).error(function(data,status){
                        var returnMes=new Object();
                        returnMes.status=status;
                        returnMes.message=data.error.message;
                        $state.go('loginSuccess.404',{returnMes:returnMes});
                    });
                }
            });
        };
        $scope.edit=function(img,index){
            bootbox.confirm("确定提交修改吗?",function(result){
                if(result){
                    var pData1=new Object();
                    var serialData=new Object();
                    serialData.id=img.id;
                    serialData.title=img.title;
                    serialData.jumping_url=img.jumping_url;
                    serialData.image_to=2;
                    serialData.admin_id=localStorageService.get('adminId');
                    pData1.body=serialData;
                    number=index+1;
                    pData1.file=$('#instrumentCarousel'+number).attr('src');
                    var url1 = 'https://api.hylaa.com/admin/image/modify',
                        data1 = pData1;
                    transFn1 = function(data) {
                        return $.param(data);
                    },
                        postCfg1 = {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                 'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                //'Date':new Date().toString(),
                            },
                            transformRequest: transFn1,
                            withCredentials:true,
                        };
                    $http.post(url1, data1, postCfg1).success(function(){
                        bootbox.alert("修改成功");
                        $state.reload();
                    }).error(function(data,status){
                        var returnMes=new Object();
                        returnMes.status=status;
                        returnMes.message=data.error.message;
                        $state.go('loginSuccess.404',{returnMes:returnMes});
                    });
                }
                else{
                    $state.reload();
                }
            });

        };
        $scope.forbidOrNot=function(img){
            if(img.forbid){
                bootbox.confirm("确定禁用该轮播图吗?",function(result){
                    if(result){
                        img.status=1;
                        var pData1=new Object();
                        var serialData=new Object();
                        serialData.id=img.id;
                        serialData.admin_id=localStorageService.get('adminId');
                        pData1.body=serialData;
                        var url1 = 'https://api.hylaa.com/admin/image/status',
                            data1 = pData1;
                        transFn1 = function(data) {
                            return $.param(data);
                        },
                            postCfg1 = {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                     'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                    //'Date':new Date().toString(),
                                },
                                transformRequest: transFn1,
                                withCredentials:true,
                            };
                        $http.post(url1, data1, postCfg1).success(function(){
                            bootbox.alert("禁用成功");
                            $state.reload();
                        }).error(function(data,status){
                            var returnMes=new Object();
                            returnMes.status=status;
                            returnMes.message=data.error.message;
                            $state.go('loginSuccess.404',{returnMes:returnMes});
                        });
                    }
                });
            }
            else{
                bootbox.confirm("确定启用该轮播图吗?",function(result){
                    if(result){
                        img.status=2;
                        var pData1=new Object();
                        var serialData=new Object();
                        serialData.id=img.id;
                        serialData.admin_id=localStorageService.get('adminId');
                        pData1.body=serialData;
                        var url1 = 'https://api.hylaa.com/admin/image/status',
                            data1 = pData1;
                        transFn1 = function(data) {
                            return $.param(data);
                        },
                            postCfg1 = {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                     'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                    //'Date':new Date().toString(),
                                },
                                transformRequest: transFn1,
                                withCredentials:true,
                            };
                        $http.post(url1, data1, postCfg1).success(function(){
                            bootbox.alert("启用成功");
                            $state.reload();
                        }).error(function(data,status){
                            var returnMes=new Object();
                            returnMes.status=status;
                            returnMes.message=data.error.message;
                            $state.go('loginSuccess.404',{returnMes:returnMes});
                        });

                    }

                });

            }
        };

        $scope.addInstrumentImage=function(){
            $rootScope.dialog=true;
            $scope.addInstrumentImageDialog=true;
        }
        $scope.newImage={title:'',jumping_url:'',image_url:''};
        $scope.hover=false;
        $rootScope.dialog=false;
        $scope.addInstrumentImageDialog=false;
        $scope.imgExists=false;

        $scope.cancelAddInstrumentImageDialog=function(){
            $rootScope.dialog=false;
            $scope.addInstrumentImageDialog=false;


        };
        $scope.submitAddInstrumentImageDialog=function(){
            var pData1=new Object();
            var serialData=new Object();
            $scope.newImage.image_url=$("#newImage2").attr('src');

            serialData.title=$scope.newImage.title;
            if (serialData.title.length ==0) {
                bootbox.alert('标题是必填项。');
                return;
            }

            serialData.jumping_url=$scope.newImage.jumping_url;
            serialData.image_to=2;
            serialData.admin_id=localStorageService.get('adminId');
            pData1.body=serialData;
            pData1.file=$scope.newImage.image_url;
            var url1 = 'https://api.hylaa.com/admin/image/create',
                data1 = pData1;
            transFn1 = function(data) {
                return $.param(data);
            },
                postCfg1 = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                         'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                        //'Date':new Date().toString(),
                    },
                    transformRequest: transFn1,
                    withCredentials:true,
                };
            $http.post(url1, data1, postCfg1).success(function(){
                $rootScope.dialog=false;
                $scope.addInstrumentImageDialog=false;
                $state.reload();
            }).error(function(data,status){
                var returnMes=new Object();
                returnMes.status=status;
                returnMes.message=data.error.message;
                $state.go('loginSuccess.404',{returnMes:returnMes});
            });


        };
    }])




//登录
    .controller('loginController',['localStorageService','$scope','$state','$http','$rootScope','postData',function(localStorageService,$scope,$state,$http,$rootScope,postData){
        $scope.needSlide = false;
        localStorageService.set('isLogin',false);



        $scope.submit=function(){
            var drag_text = $('.drag_text').text();
            if (drag_text != '验证通过') {
                $scope.needSlide = true;
                return;
            }
            var myForm=new Object();
            myForm.username=$scope.userName;
            myForm.password=$scope.password;
            var credential=new Object();
            credential.credentials=myForm;
            var pData=new Object();
            pData.body=credential;
            var jsonData=JSON.stringify(pData);
            var paramData=$.param(pData);
            var url = 'https://api.hylaa.com/admin/login',
                data = pData;
                transFn = function(data) {
                    return $.param(data);
                },
                postCfg = {
                    headers: {
                       'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                       'Access-Control-Allow-Origin' : '*'
                        //'Date':new Date().toString(),
                    },
                    transformRequest: transFn,
                    withCredentials:true,
                };


            $http.post(url, data, postCfg).success(function (res) {
                localStorageService.set('accessToken',res.body.accessToken);
                localStorageService.set('adminId',res.body.admin_id);
                localStorageService.set('isLogin',true);
                $rootScope.isLogin=localStorageService.get('isLogin');
                $state.go('loginSuccess');

            }).error(function(data,status){
                $state.go('404',{status:status});
            });
           

        };

    }])
.controller('loginSuccessController',['$scope','localStorageService','$state','postData','$rootScope','$stateParams',function($scope,localStorageService,$state,postData,$rootScope,$stateParams){


    $scope.status=[
       {open:false,},
       {open:false,},
       {open:false,},
       {open:false,},
       {open:false,},
       {open:false,},
       {open:false,}
   ]

}])

.controller('OrderListController', ['orderList','$scope', 'postData', '$state', function(orderList,$scope,postData, $state) {
   //for pagination
    $scope.pagesize = 9;
    $scope.page_num = orderList.body.page_num;
    $scope.currentPage = 1;

    $scope.setPage = function () {
        postData.postService('https://api.hylaa.com/admin/order/list', {body : {
                pagesize : 9,
                page : ($scope.currentPage==0 ? 1 : $scope.currentPage) ,
                order_type : $scope.order_type,
                order_status : $scope.order_status,
                created_from : $scope.created_from,
                created_to : $scope.created_to
        }

        }
        ).then(function (res) {
            $scope.orders = res.body.order_list;
        })
    };

    $scope.$watch('currentPage', $scope.setPage );
 
    $scope.beforeRenderStartDate = function($view, $dates, $leftDate, $upDate, $rightDate) {
        if ($scope.created_to) {
            var activeDate = moment($scope.dateRangeEnd);
            for (var i = 0; i < $dates.length; i++) {
                if ($dates[i].localDateValue() >= activeDate.valueOf()) $dates[i].selectable = false;
            }
        }
    }

    $scope.beforeRenderEndDate = function($view, $dates, $leftDate, $upDate, $rightDate) {
        if ($scope.created_from) {
            var activeDate = moment($scope.dateRangeStart).subtract(1, $view).add(1, 'minute');
            for (var i = 0; i < $dates.length; i++) {
                if ($dates[i].localDateValue() <= activeDate.valueOf()) {
                    $dates[i].selectable = false;
                }
            }
        }
    }
    $scope.setCreatedFrom = function (newDate, oldDate) {
        var result = new moment(newDate).format('YYYY-MM-DD hh:mm');
        $scope.created_from= result;
    }
    $scope.setCreatedTo = function (newDate, oldDate) {
        var result = new moment(newDate).format('YYYY-MM-DD hh:mm');
        $scope.created_to= result;
    }
    
    $scope.orders = orderList.body.order_list;
    $scope.orderTypeList = [
        {id : 'ALL', name :'全部'},
        {id : 'I', name : '乐器'},
        {id : 'C', name : '课程'}
    ];
    $scope.orderStatusList = [
        {id : '', name : ''},
        {id : 1, name : '未付款'},
        {id : 2, name : '已付款'},
        {id : 4, name : '已发货'},
        {id : 8, name : '已收货，订单已成交'},
        {id : 16, name : '已取消'},
        {id : 32, name : '处理中'},
        {id : 64, name : '已退款'},
        {id : 128, name : '已退货'},
    ];
    $scope.order_type = 'ALL';

    $scope.search = function () {
        var searchCriteria = {
            pagesize : 9,
            page : 1,
            order_type : $scope.order_type,
            order_status : $scope.order_status,
            created_from : $scope.created_from,
            created_to : $scope.created_to
        };
        var url = 'https://api.hylaa.com/admin/order/list';
        postData.postService(url, {body:searchCriteria}).then(function (res) {
            $scope.orders = res.body.order_list;
        })
    };
    
    $scope.removeOrder = function (order) {
        bootbox.confirm('确认删除订单？' ,function (result) {
            if (result) {
                for (var i=0; i<$scope.orders.length;i++) {
                    if ($scope.orders[i].order_id == order.order_id) {
                        $scope.orders.splice(i, 1);
                    }
                }
            }
            var data = {order_id : order.order_id},
                url = 'https://api.hylaa.com/admin/order/delete';
            postData.postService(url,{body:data}).then(function (res) {
                console.log(res);
                bootbox.alert("删除成功！");
            })
        })
        
    }
}])
    .controller('OrderDetailController', ['data','$scope', 'postData','$state',function (data, $scope, postData,$state) {
        $scope.orderDetail = data.body;
        $scope.classTimeArray = null;
        
        $scope.selectedStatus = $scope.orderDetail.order_status;
        if (!$scope.orderDetail.express) {
            $scope.orderDetail.express = {
                express_company : '',
                express_no : '',
                fee : ''
            }
        }
        $scope.statusOps = [
            {id : '1', name : '未支付'},
            {id : '2', name : '已付款'},
            {id : '4', name : '已发货'},
            {id : '8', name : '已收货，订单已成交'},
            {id : '16', name : '已取消'},
            {id : '32', name : '处理中'},
            {id : '64', name : '已退款'},
            {id : '128', name : '已退货'}
        ]
        if ($scope.orderDetail.order_type == 'C') {
            $scope.statusOps = [
                {id : '1', name : '未支付'},
                {id : '2', name : '已付款'},
                {id : '16', name : '已取消'},
                {id : '32', name : '处理中'},
                {id : '64', name : '已退款'},
            ]
        }
        $scope.showClassTime = function (order_id) {
            var url = 'https://api.hylaa.com/admin/userClass/list';
            var data = {order_id : order_id};
            postData.postService(url, {body:data}).then(function (res) {
                $scope.classTimeArray = res.body;
            });
        }
        $scope.updateClassTime = function(order_id) {
            bootbox.confirm('确认修改上课时间?', function (result) {
                if (result) {
                    var url = 'https://api.hylaa.com/admin/userClass/modify',
                        data = {
                            body : {
                                order_id : order_id,
                                user_class : $scope.classTimeArray
                            }
                        };
                    postData.postService(url,data).then(function(res) {
                        bootbox.alert('更改成功!');
                    })
                }
            })


        }
        $scope.refuseRefund = function (orderDetail) {
            bootbox.confirm('确认取消退款?', function (result) {
                if (result) {
                    var url = 'https://api.hylaa.com/admin/order/refuseRefund',
                        data = {
                            body : {order_id : orderDetail.order_id}
                        };
                    postData.postService(url, data).then(function (res) {
                        console.log(res);
                        bootbox.alert('更改成功!');
                        $state.go('loginSuccess.orderList');
                    })
                }
            })
        }
        $scope.refuseReturn = function (orderDetail) {
            bootbox.confirm('确认取消退货?', function (result) {
                if (result) {
                    var url = 'https://api.hylaa.com/admin/order/refuseReturn',
                        data = {
                            body : {order_id : orderDetail.order_id}
                        };
                    postData.postService(url, data).then(function (res) {
                        console.log(res);
                        bootbox.alert('更改成功!');
                        $state.go('loginSuccess.orderList');
                    })
                }
            })
        }

        $scope.changeStatus = function (orderDetail) {
            bootbox.confirm('确认提交更改?', function (result) {
                if (result) {
                    var url = 'https://api.hylaa.com/admin/order/status';
                    var data = {
                        body : {
                            order_id : orderDetail.order_id,
                            order_status : $scope.selectedStatus
                        }
                    };
                    
                    if ($scope.selectedStatus == 64) {
                        url = 'https://api.hylaa.com/admin/order/refund';
                        data = {
                            body : {order_id : orderDetail.order_id}
                        };
                    }
                    else if ($scope.selectedStatus == 128) {
                        url = 'https://api.hylaa.com/admin/order/refund';
                        data = {
                            body : {order_id : orderDetail.order_id}
                        };
                    }

                    postData.postService(url,data).then(function (res) {
                        if (res.body.url) {//退款-》打开付款页面
                            window.open(res.body.url);
                            bootbox.alert(res.message);
                        } else {
                            console.log(res);
                            bootbox.alert('更改成功!');
                            $state.go('loginSuccess.orderList');
                        }

                    })
                }
            })

        }
    }])
   
    
    .controller('userInfoController', ['localStorageService','response','$http','$scope','$rootScope','$state',function (localStorageService,response,$http,$scope,$rootScope,$state) {
       $scope.users=response.data.body.user_list;

        $scope.pagesize =8;
        $scope.page_num = response.data.body.page_num;
        $scope.page=1;
        $scope.setPage = function () {

            var pData1=new Object();
            var serialData=new Object();
            serialData.pagesize=8;
            serialData.page=($scope.page==0 ? 1 : $scope.page) ;
            serialData.admin_id=localStorageService.get('adminId');
            pData1.body=serialData;
            var url1 = 'https://api.hylaa.com/admin/user/list',
                data1 = pData1;
            transFn1 = function(data) {
                return $.param(data);
            },
                postCfg1 = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                        'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                        // 'Date':new Date().toUTCString(),
                    },
                    transformRequest: transFn1,
                    withCredentials:true,
                };
            $http.post(url1, data1, postCfg1).success(function (res) {
                $scope.users = res.body.user_list;
            }).error(function(data,status){
                var returnMes=new Object();
                returnMes.status=status;
                returnMes.message=data.error.message;
                $state.go('loginSuccess.404',{returnMes:returnMes});
            });
        };

        $scope.$watch( 'page', $scope.setPage );

        $scope.changeRole=function(user){
            bootbox.confirm("确定更改用户角色吗",function(result){
                if(result){
                    var pData1=new Object();
                    var serialData=new Object();
                    serialData.option='authority';
                    serialData.user_id=user.id;
                    serialData.admin_id=localStorageService.get('adminId');
                    serialData.info={'role':user.role};
                    pData1.body=serialData;
                    var url1 = 'https://api.hylaa.com/admin/user/modify',
                        data1 = pData1;
                    transFn1 = function(data) {
                        return $.param(data);
                    },
                        postCfg1 = {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                 'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                //'Date':new Date().toString(),
                            },
                            transformRequest: transFn1,
                            withCredentials:true,
                        };
                    $http.post(url1, data1, postCfg1).success(function(){
                        bootbox.alert("更改角色成功");

                    }).error(function(data,status){
                        var returnMes=new Object();
                        returnMes.status=status;
                        returnMes.message=data.error.message;
                        $state.go('loginSuccess.404',{returnMes:returnMes});
                    });
                }
                else{
                    $state.reload();
                }
            });
        };
      $scope.forbidOrNot=function(user){
            if(user.status=='4'){
                bootbox.confirm("确定禁用该用户吗?",function(result){
                    if(result){
                        user.status=8;
                        var pData1=new Object();
                        var serialData=new Object();
                        serialData.option='ability';
                        serialData.user_id=user.id;
                        serialData.admin_id=localStorageService.get('adminId');
                        pData1.body=serialData;
                        var url1 = 'https://api.hylaa.com/admin/user/modify',
                            data1 = pData1;
                        transFn1 = function(data) {
                            return $.param(data);
                        },
                            postCfg1 = {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                     'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                    //'Date':new Date().toString(),
                                },
                                transformRequest: transFn1,
                                withCredentials:true,
                            };
                        $http.post(url1, data1, postCfg1).success(function(){
                            bootbox.alert("禁用成功");
                        }).error(function(data,status){
                            var returnMes=new Object();
                            returnMes.status=status;
                            returnMes.message=data.error.message;
                            $state.go('loginSuccess.404',{returnMes:returnMes});
                        });

                    }
                    else{
                        $state.reload();
                    }

                });

            }
            else{
                bootbox.confirm("确定启用该用户吗?",function(result){
                    if(result){
                        user.status=4;
                        var pData1=new Object();
                        var serialData=new Object();
                        serialData.option='ability';
                        serialData.user_id=user.id;
                        serialData.admin_id=localStorageService.get('adminId');
                        pData1.body=serialData;
                        var url1 = 'https://api.hylaa.com/admin/user/modify',
                            data1 = pData1;
                        transFn1 = function(data) {
                            return $.param(data);
                        },
                            postCfg1 = {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                     'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                    //'Date':new Date().toString(),
                                },
                                transformRequest: transFn1,
                                withCredentials:true,
                            };
                        $http.post(url1, data1, postCfg1).success(function(){
                            bootbox.alert("启用成功");
                        }).error(function(data,status){
                            var returnMes=new Object();
                            returnMes.status=status;
                            returnMes.message=data.error.message;
                            $state.go('loginSuccess.404',{returnMes:returnMes});
                        });

                    }
                    else{
                        $state.reload();
                    }

                });

            }
        }





        $scope.resetPassword=function(user){
            bootbox.confirm("确定重置该用户的密码吗",function(result){
                if(result){
                    user.status=8;
                    var pData1=new Object();
                    var serialData=new Object();
                    serialData.option='password';
                    serialData.user_id=user.id;
                    serialData.admin_id=localStorageService.get('adminId');
                    pData1.body=serialData;
                    var url1 = 'https://api.hylaa.com/admin/user/modify',
                        data1 = pData1;
                    transFn1 = function(data) {
                        return $.param(data);
                    },
                        postCfg1 = {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                 'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                //'Date':new Date().toString(),
                            },
                            transformRequest: transFn1,
                            withCredentials:true,
                        };
                    $http.post(url1, data1, postCfg1).success(function(){
                        bootbox.alert("重置为初始密码123456");
                    }).error(function(data,status){
                        var returnMes=new Object();
                        returnMes.status=status;
                        returnMes.message=data.error.message;
                        $state.go('loginSuccess.404',{returnMes:returnMes});
                    });
                }
            });
        }

        $scope.toDetail=function (user) {
            localStorageService.set('editedUser',user);
            $state.go('loginSuccess.userDetail');
        }




        $scope.recommendOrNot=function(user){
            if(user.recommend==1){
                bootbox.confirm("确定取消推荐老师吗?",function(result){
                    if(result){
                        var pData1=new Object();
                        var serialData=new Object();
                        serialData.recommend_type='4';
                        serialData.recommend_id=user.id;
                        serialData.admin_id=localStorageService.get('adminId');
                        pData1.body=serialData;
                        var url1 = 'https://api.hylaa.com/admin/recommend/set',
                            data1 = pData1;
                        transFn1 = function(data) {
                            return $.param(data);
                        },
                            postCfg1 = {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                    'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                    //'Date':new Date().toString(),
                                },
                                transformRequest: transFn1,
                                withCredentials:true,
                            };
                        $http.post(url1, data1, postCfg1).success(function(){
                            bootbox.alert("取消推荐成功");
                            $state.reload();
                        }).error(function(data,status){
                            var returnMes=new Object();
                            returnMes.status=status;
                            returnMes.message=data.error.message;
                            $state.go('loginSuccess.404',{returnMes:returnMes});
                        });

                    }

                });

            }
            else{
                bootbox.confirm("确定推荐老师吗?",function(result){
                    if(result){
                        var pData1=new Object();
                        var serialData=new Object();
                        serialData.recommend_type='4';
                        serialData.recommend_id=user.id;
                        serialData.admin_id=localStorageService.get('adminId');
                        pData1.body=serialData;
                        var url1 = 'https://api.hylaa.com/admin/recommend/set',
                            data1 = pData1;
                        transFn1 = function(data) {
                            return $.param(data);
                        },
                            postCfg1 = {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                                    'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                                    //'Date':new Date().toString(),
                                },
                                transformRequest: transFn1,
                                withCredentials:true,
                            };
                        $http.post(url1, data1, postCfg1).success(function(){
                            bootbox.alert("推荐成功");
                            $state.reload();
                        }).error(function(data,status){
                            var returnMes=new Object();
                            returnMes.status=status;
                            returnMes.message=data.error.message;
                            $state.go('loginSuccess.404',{returnMes:returnMes});
                        });

                    }

                });

            }
        }

    }])
    .controller('userDetailController',['$scope','response',function($scope,response){
        $scope.user=response.data.body;
    }])
    .controller('helpCenterController',['$rootScope','$state','$scope','response','$http','localStorageService',function($rootScope,$state,$scope,response,$http,localStorageService){
        $scope.helpCenters=response.data.body.help_center;
        $scope.pagesize = 12;
        $scope.page_num = response.data.body.page_num;
        $scope.page = 1;
        $scope.setPage=function () {
            var pData1=new Object();
            var serialData=new Object();
            serialData.pagesize=12;
            serialData.page= ($scope.page==0 ? 1 : $scope.page);
            serialData.admin_id=localStorageService.get('adminId');
            pData1.body=serialData;
            var url1 = 'https://api.hylaa.com/admin/helpCenter/list',
                data1 = pData1;
            transFn1 = function(data) {
                return $.param(data);
            },
                postCfg1 = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                        'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                        // 'Date':new Date().toUTCString(),
                    },
                    transformRequest: transFn1,
                    withCredentials:true,
                };
            $http.post(url1, data1, postCfg1).success(function (res) {
                $scope.helpCenters = res.body.help_center;
            }).error(function(data,status){
                var returnMes=new Object();
                returnMes.status=status;
                returnMes.message=data.error.message;
                $state.go('loginSuccess.404',{returnMes:returnMes});
            });
        }

        $scope.$watch( 'page', $scope.setPage );


        $scope.addHelpCenter=function(){
            $rootScope.dialog=true;
            $scope.addHelpCenterDialog=true;
        };
        $scope.newHelpCenter={title:'',content:'',url:''};
        $rootScope.dialog=false;
        $scope.addHelpCenterDialog=false;

        $scope.cancelHelpCenterDialog=function(){
            $rootScope.dialog=false;
            $scope.addHelpCenterDialog=false;


        };
        $scope.submitHelpCenterDialog=function(){
            var pData1=new Object();
            var serialData=new Object();

            serialData.title=$scope.newHelpCenter.title;
            serialData.content=$scope.newHelpCenter.content;
            serialData.url=$scope.newHelpCenter.url;
            serialData.admin_id=localStorageService.get('adminId');
            pData1.body=serialData;
            var url1 = 'https://api.hylaa.com/admin/helpCenter/create',
                data1 = pData1;
            transFn1 = function(data) {
                return $.param(data);
            },
                postCfg1 = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                        'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                        //'Date':new Date().toString(),


                    },
                    transformRequest: transFn1,
                    withCredentials:true,
                };
            $http.post(url1, data1, postCfg1).success(function(){
                $rootScope.dialog=false;
                $scope.addHelpCenterDialog=false;
                $state.reload();
            }).error(function(data,status){
                var returnMes=new Object();
                returnMes.status=status;
                returnMes.message=data.error.message;
                $state.go('loginSuccess.404',{returnMes:returnMes});
            });


        };

    }])
    .controller('suggestionController',['$scope','response','$http','localStorageService',function($scope,response,$http,localStorageService){
        $scope.suggestions=response.data.body.suggestions;
        $scope.pagesize = 12;
        $scope.page_num = response.data.body.page_num;
        $scope.page = 1;
        $scope.setPage=function () {
            var pData1=new Object();
            var serialData=new Object();
            serialData.pagesize=12;
            serialData.page= ($scope.page==0 ? 1 : $scope.page);
            serialData.admin_id=localStorageService.get('adminId');
            pData1.body=serialData;
            var url1 = 'https://api.hylaa.com/admin/suggestion/list',
                data1 = pData1;
            transFn1 = function(data) {
                return $.param(data);
            },
                postCfg1 = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                        'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                        // 'Date':new Date().toUTCString(),
                    },
                    transformRequest: transFn1,
                    withCredentials:true,
                };
            $http.post(url1, data1, postCfg1).success(function (res) {
                $scope.suggestions = res.body.suggestions;
            }).error(function(data,status){
                var returnMes=new Object();
                returnMes.status=status;
                returnMes.message=data.error.message;
                $state.go('loginSuccess.404',{returnMes:returnMes});
            });
        }

        $scope.$watch( 'page', $scope.setPage );

    }])

    .controller('sysMessageController',['$scope','$rootScope','localStorageService','$http','response','$state',function($scope,$rootScope,localStorageService,$http,response,$state){
        $scope.sysMessages=response.data.body.system_message;
        $scope.pagesize = 12;
        $scope.page_num = response.data.body.page_num;
        $scope.page = 1;

        $scope.setPage = function () {

            var pData1=new Object();
            var serialData=new Object();
            serialData.pagesize=12;
            serialData.page=($scope.page==0 ? 1 : $scope.page) ;
            serialData.admin_id=localStorageService.get('adminId');
            pData1.body=serialData;
            var url1 = 'https://api.hylaa.com/admin/sysMessage/list',
                data1 = pData1;
            transFn1 = function(data) {
                return $.param(data);
            },
                postCfg1 = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                        'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                        // 'Date':new Date().toUTCString(),
                    },
                    transformRequest: transFn1,
                    withCredentials:true,
                };
            $http.post(url1, data1, postCfg1).success(function (res) {
                $scope.sysMessages = res.body.system_message;
            }).error(function(data,status){
                var returnMes=new Object();
                returnMes.status=status;
                returnMes.message=data.error.message;
                $state.go('loginSuccess.404',{returnMes:returnMes});
            });
        };

        $scope.$watch( 'page', $scope.setPage );


        $scope.addSysMessage=function(){
            $rootScope.dialog=true;
            $scope.addSysMessageDialog=true;
        };
        $scope.newSysMessage={title:'',content:'',need_notify:false};
        $rootScope.dialog=false;
        $scope.addSysMessageDialog=false;

        $scope.cancelSysMessageDialog=function(){
            $rootScope.dialog=false;
            $scope.addSysMessageDialog=false;


        };
        $scope.submitSysMessageDialog=function(){
            var pData1=new Object();
            var serialData=new Object();

            serialData.title=$scope.newSysMessage.title;
            serialData.content=$scope.newSysMessage.content;
            console.log($scope.newSysMessage.need_notify);
            serialData.need_notify=$scope.newSysMessage.need_notify;
            serialData.admin_id=localStorageService.get('adminId');
            pData1.body=serialData;
            var url1 = 'https://api.hylaa.com/admin/sysMessage/create',
                data1 = pData1;
            transFn1 = function(data) {
                return $.param(data);
            },
                postCfg1 = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization' :'Bearer '+localStorageService.get('accessToken'),
                        'X-GTEDX-Integrity':'GSign '+localStorageService.get('accessToken'),
                        //'Date':new Date().toString(),


                    },
                    transformRequest: transFn1,
                    withCredentials:true,
                };
            $http.post(url1, data1, postCfg1).success(function(){
                $rootScope.dialog=false;
                $scope.addSysMessageDialog=false;
                $state.reload();
            }).error(function(data,status){
                var returnMes=new Object();
                returnMes.status=status;
                returnMes.message=data.error.message;
                $state.go('loginSuccess.404',{returnMes:returnMes});
            });


        };
    }])

