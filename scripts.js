var experiment = "Pilot";
var condition = "scatter";
var questionMax = 56;

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
  //console.log(this.responseText);
  document.getElementById('stim').src = "data/"+experiment+"/"+condition+"/"+this.responseText;
  document.getElementById("questionForm")["stim"].value = this.responseText;
  var x1 = 0,
  x2 = 0,
  r1 = 0,
  r2 = 0;
  while(screenDist(x1,r1,x2,r2)<10){
   x1 = Math.random(1);
   x2 = Math.random(1);
   r1 = Math.random(1);
   r2 = Math.random(1);
  }
  document.getElementById("circle1").style.left = toScreenX(x1);
  document.getElementById("circle1").style.top = toScreenY(r1) - 10;
  document.getElementById("circle2").style.left = toScreenX(x2);
  document.getElementById("circle2").style.top = toScreenY(r2) - 20;
  document.getElementById("questionForm")["r1"].value = r1;
  document.getElementById("questionForm")["r2"].value = r2;
  document.getElementById("questionForm")["x1"].value = x1;
  document.getElementById("questionForm")["x2"].value = x2;
  
}

function screenDist(x1,y1,x2,y2){
  return Math.sqrt( Math.pow((x1*450)-(x2*450),2) + Math.pow((y1*450)-(y2*450),2) );
}

function doneWrite(){
  document.getElementById("green").checked = false;
  document.getElementById("orange").checked = false;
  getRndImg(); 
  document.getElementById("questionId").value++;
  var questionNum = document.getElementById("questionId").value;
  if(questionNum>questionMax){
    window.location = "posttest.html";
  }
  else{
    document.getElementById("questionNum").innerHTML = questionNum;
  }
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


function initialize(){
  document.addEventListener("keydown",keyPressed);
  document.getElementById("left").addEventListener("click",clickLeft);
  document.getElementById("right").addEventListener("click",clickRight);
  document.getElementById("questionMax").innerHTML = questionMax;
  getRndImg();
}

function getRndImg(){  
  var imgRequest = new XMLHttpRequest();
  imgRequest.open("GET","data/genStimuli.php?experiment="+experiment+"&condition="+condition,true);
  imgRequest.addEventListener("load",receiveImg);
  imgRequest.send();
}

function writeAnswer(){
  var answer = document.getElementById("questionForm")["choice"].value;
  if(!id){
    var id = "DEBUG";
  }
  var questionNum = document.getElementById("questionForm")["questionId"].value;
  var r1 = document.getElementById("questionForm")["r1"].value;
  var r2 = document.getElementById("questionForm")["r2"].value;
  var x1 = document.getElementById("questionForm")["x1"].value;
  var x2 = document.getElementById("questionForm")["x2"].value;
  var stim = document.getElementById("questionForm")["stim"].value;
  var writeRequest = new XMLHttpRequest();
  var writeString = "data/write.php?workerID="+id+"&experiment="+experiment+"&condition="+condition+"&n="+questionNum+"&stim="+stim+"&answer="+answer+"&r1="+r1+"&r2="+r2+"&x1="+x1+"&x2="+x2;
  writeRequest.open("GET",writeString);
  writeRequest.addEventListener("load",doneWrite);
  writeRequest.send();
}

function keyPressed(event){
  if(event.keyCode == 37){
    clickLeft();
  }
  else if(event.keyCode == 39){
    clickRight();
  } 
  
}

function clickLeft(){
  document.getElementById("questionForm")["choice"].value = -1;
  writeAnswer();
}

function clickRight(){
  document.getElementById("questionForm")["choice"].value = 1;
  writeAnswer();
}
