/**
 * Created by huangzhibiao on 16/4/11.
 * 页面加载loading
 */
'use strict';
(function(win){
  //初始化rquire，因为引入browserify之后node的require函数被取代
  try {
    win.nw = {
      require: require
    };
    var gui = require('nw.gui');
    if (process.platform == "darwin") {
      var menu = new gui.Menu({type: "menubar"});
      menu.createMacBuiltin && menu.createMacBuiltin(window.document.title);
      gui.Window.get().menu = menu;
    }
  }catch(e){}








  //var PageLoading = function(_size,_r){
  //  var _this = this,_time = new Date().getTime();
  //  this.radius = _r || 100;
  //  this.size = _size || 300;
  //  this.perimeter = Math.PI * 2 * _r;
  //  this.containerDivId = "div-" + _time;
  //  this.persentTextId = "text-"+_time;
  //}
  //PageLoading.prototype.addElement=function(_callback){
  //  var _template = '<svg width="'+this.size+'" height="'+this.size+'" viewbox="0 0 '+this.size+' '+this.size+'">'+
  //    '<circle cx="'+this.size / 2+'" cy="'+this.size / 2+'" r="'+this.radius+'" stroke-width="10" stroke="#FFFFFF" fill="none"></circle>'+
  //    '<circle cx="'+this.size / 2+'" cy="'+this.size / 2+'" r="'+this.radius+'" stroke-width="10" stroke="#00A5E0" fill="none" transform="matrix(0,-1,1,0,0,'+this.size+')" stroke-dasharray="1 1069"></circle>'+
  //    '</svg>';
  //  var _block = document.createElement("div");
  //  _block.setAttribute("id","block_"+this.containerDivId);
  //  _block.style.width = "100%";
  //  _block.style.height = "100%";
  //  _block.style.position = "fixed";
  //  _block.style.top = "0";
  //  _block.style.left = "0";
  //  _block.style.zIndex = "1";
  //  _block.style.backgroundColor = "#24272B";
  //
  //  var div = document.createElement("div");
  //  div.setAttribute("id",this.containerDivId);
  //  div.style.width = parseFloat(this.size) + "px";
  //  div.style.height = parseFloat(this.size) + "px";
  //  div.style.position = "fixed";
  //  div.style.zIndex = "2";
  //  div.style.top = "50%";
  //  div.style.left = "50%";
  //  div.style.marginTop = -(parseFloat(this.size) / 2) + "px";
  //  div.style.marginLeft = -(parseFloat(this.size) / 2) + "px";
  //
  //  var percentText = document.createElement("span");
  //  percentText.setAttribute("id",this.persentTextId);
  //  percentText.style.display = "block";
  //  percentText.style.width = "100%";
  //  percentText.style.height = "100%";
  //  percentText.style.textAlign = "center";
  //  percentText.style.position = "absolute";
  //  percentText.style.top = 0;
  //  percentText.style.left = 0;
  //  percentText.style.lineHeight = parseFloat(this.size) + "px";
  //  percentText.style.fontSize = "24px";
  //  percentText.style.color = "#FFFFFF";
  //  percentText.textContent = "1%";
  //
  //  div.innerHTML = _template;
  //  div.appendChild(percentText);
  //  var _this = this;
  //  var addLoadingToBody = function(){
  //    if(document.body){
  //      document.body.appendChild(_block);
  //      document.body.appendChild(div);
  //      _this.percentInit(parseInt(document.body.dataset['percent']));
  //      if(typeof _callback == 'function'){
  //        _callback();
  //      }
  //    }else{
  //      setTimeout(addLoadingToBody,1)
  //    }
  //  }
  //  setTimeout(addLoadingToBody,1);
  //};
  //PageLoading.prototype.percentInit=function(_percent){
  //  var _this = this;
  //  var circle = document.querySelectorAll("circle")[1];
  //  var percent = _percent / 100, perimeter = this.perimeter
  //  circle.setAttribute('stroke-dasharray', perimeter * percent + " " + perimeter * (1- percent));
  //  setTimeout(function(){
  //    var spanText=  document.getElementById(_this.persentTextId);
  //    spanText.textContent = _percent + "%";
  //  },0.12)
  //};
  //PageLoading.init = function(_size,_route){
  //  var pageLoading = new PageLoading(_size,_route);
  //  pageLoading.addElement(function(){
  //    var _interval = win.setInterval(function(){
  //      var percentElements = document.getElementsByClassName("percent-loaded");
  //      if(percentElements && percentElements.length){
  //        var percentElement = percentElements[percentElements.length -1];
  //        var percentVal = parseInt(percentElement.dataset['percent']);
  //        pageLoading.percentInit(percentVal);
  //        if(percentVal >= 100){
  //          win.clearInterval(_interval);
  //          setTimeout(function(){
  //            document.body.removeChild(document.getElementById("block_"+pageLoading.containerDivId))
  //            document.body.removeChild(document.getElementById(pageLoading.containerDivId))
  //            document.head.removeChild(document.getElementById("page-loading-script"));
  //          },300)
  //        }
  //      }
  //    },50)
  //  });
  //}
  //PageLoading.init(320,150);
})(window)


