var experiment = "Pilot";
var condition = "scattertrend";
var r1 = 0;
var r2 = 0;

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

function receiveImg(){
  console.log(this.responseText);
  document.getElementById('stim').src = this.responseText;
}

function doneWrite(){
  document.getElementById("green").checked = false;
  document.getElementById("orange").checked = false;
  getRndImg();
}

function validate(){
  var selected = document.getElementById("questionForm")["choice"].value;
  if(selected!="-1" && selected!="1"){
    alert("Please select an option");
    return false;
  }
  else{
    writeAnswer();
    return true;
  }

}

function getRndImg(){
  
  var imgRequest = new XMLHttpRequest();
  imgRequest.open("GET","data/genStimuli.php?experiment="+experiment+"&condition="+condition,true);
  imgRequest.addEventListener("load",receiveImg);
  imgRequest.send();
}

function writeAnswer(){
  var writeRequest = new XMLHttpRequest();
  writeRequest.open("GET","data/write.php?id="+id+"&experiment="+experiment+"&condition="+condition+"&stim="+stim+"&answer="+answer+"&r1="+r1+"&r2="+r2);
  
  writeRequest.addEventListener("load",doneWrite);
  writeRequest.send();
}
