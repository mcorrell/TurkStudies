var experiment = "Pilot";

function gup(name){
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var tmpURL = window.location.href;
  var results = regex.exec( tmpURL );
  if( results == null )
    return "";
  else
    return results[1];
}

function validateMain(){

}

function plotDot(x1,x2,r1,r2,m,b){
  document.getElementById('circle1').style.left= toScreenX(x1)-5+"px";
  document.getElementById('circle1').style.top=  toScreenY((m*(x1))+b+r1)-5+"px";
  document.getElementById('circle2').style.left = toScreenX(x2)-5+"px";
  document.getElementById('circle2').style.top= toScreenY((m*(x2))+b+r2)-15+"px";
}

function toScreenX(x){
  return x*450;
}

function toScreenY(y){
  return y*-450;
}

function toScreen(xy){
  return [toScreenX(xy[0]),toScreenY(xy[1])];
}

