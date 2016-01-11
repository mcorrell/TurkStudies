var experiment = "Pilot";
var conditions = ['scatter','scattertrend','trend'];
var condition = "scatter";
var questionMax = 60;
var enabled = false;
var startTime;
var questions = Array(questionMax);



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
  document.getElementById('circle1').style.top=  toScreenY((m*(x1))+b+r1)-15+"px";
  document.getElementById('circle2').style.left = toScreenX(x2)-5+"px";
  document.getElementById('circle2').style.top= toScreenY((m*(x2))+b+r2)-25+"px";
}

function RToY(r,x,m,b){
  return r+(m*x)+b;
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

function clamp(num){
  return Math.min(1,Math.max(0,num));
}

function parseImg(img){
  var imgParts = img.split("_");
  var properties = {};
  properties.m = (imgParts[3].substr(2))/1000;
  properties.b = (imgParts[4].substr(1))/1000;
  return properties;
}

function receiveImg(){
  var questionNum = document.getElementById("questionId").value;
  var curQ = questions[questionNum-1];
  document.getElementById('stim').src = "data/"+experiment+"/"+condition+"/"+this.responseText;
  document.getElementById("questionForm")["stim"].value = this.responseText;
  //console.log(this.responseText); 
  var x1 = 0,
  x2 = 0,
  r1 = 0,
  r2 = 0,
  stim = parseImg(this.responseText);
  while(screenDist(x1,r1,x2,r2)<10){
   x1 = clamp((Math.random()*0.5)+0.25);
   x2 = clamp((Math.random()*0.5)+0.25);
   r1 = Math.random()-0.5;
   r2 = Math.random()-0.5;
   if((curQ.winner===-1 && r1>r2) || (curQ.winner===1 && r2>r1)){
     var temp = r1;
     r1 = r2;
     r2 = temp;
   }
  plotDot(x1,x2,r1,r2,stim.m,stim.b);
   //r1 = RToY(0,x1,stim.m,stim.b);
   //r2 = RToY(0,x2,stim.m,stim.b);
   var y1 = clamp(RToY(Math.abs(r1)*curQ.signOne,x1,stim.m,stim.b));
   var y2 = clamp(RToY(Math.abs(r2)*curQ.signTwo,x2,stim.m,stim.b));
   //console.log("("+x1+","+r1+")"+" ("+x2+","+r2+")");
  }

  document.getElementById("questionForm")["y1"].value = y1;
  document.getElementById("questionForm")["y2"].value = y2;
  document.getElementById("questionForm")["r1"].value = r1;
  document.getElementById("questionForm")["r2"].value = r2;
  document.getElementById("questionForm")["x1"].value = x1;
  document.getElementById("questionForm")["x2"].value = x2;
  enabled = true;
  startTime = (new Date()).getTime(); 
}

function screenDist(x1,y1,x2,y2){
  return Math.sqrt( Math.pow((x1*450)-(x2*450),2) + Math.pow((y1*450)-(y2*450),2) );
}

function doneWrite(){
  document.getElementById("green").checked = false;
  document.getElementById("orange").checked = false;
   
  document.getElementById("questionId").value++;
  var questionNum = document.getElementById("questionId").value;
  if(questionNum>questionMax){
    window.location = "posttest.html?workerId="+gup('workerId')+"&assignmentId="+gup('assignmentId');
  }
  else{
    getRndImg();
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


function rndCondition(){
  return conditions[Math.floor(Math.random()*conditions.length)];
}

function initialize(){
  document.addEventListener("keydown",keyPressed);
  document.getElementById("left").addEventListener("click",clickLeft);
  document.getElementById("right").addEventListener("click",clickRight);
  document.getElementById("questionMax").innerHTML = questionMax;
  rndStimuli();
  getRndImg();
}

function getRndImg(){
  var questionNum = document.getElementById("questionId").value; 
  condition = questions[questionNum-1].condition; 
  var imgRequest = new XMLHttpRequest();
  imgRequest.open("GET","data/genStimuli.php?experiment="+experiment+"&condition="+condition,true);
  imgRequest.addEventListener("load",receiveImg);
  imgRequest.send();
}

function permute(anArray){
  //Knuth shuffle
  var j = 0;
  var temp;
  var tempArray = anArray.slice(0);
  for(var i = 0;i<anArray.length;i++){
    j = Math.floor(Math.random()*i);
    temp = tempArray[j];
    tempArray[j] = tempArray[i];
    tempArray[i] = temp;
  }
 return tempArray; 
}

function rndStimuli(){
  // Things to control for:
  // Number of "same side" vs. opposite side comparisons
  // Scatter/scattertrend/trend
  // 60 stim = 20 per scatter, 10 per scatter per side.
  // Only allow xs in [-0.5,0.5], rs in the same range.
  // 30 "winners" per color  
  var i;
  for(i = 0;i<questions.length;i++){
    questions[i] = {};
    if(i<questions.length/2){
      questions[i].winner = -1; 
    }
    else{
      questions[i].winner = 1;
    }
    questions[i].condition = conditions[i%conditions.length]; 
    questions[i].signOne = i%2==0 ? 1 : -1;
    questions[i].signTwo = i%4 < 2 ? 1 : -1; 
  } 

  questions = permute(questions);
}

function writeAnswer(){
  var rt = (new Date()).getTime() - startTime;
  var answer = document.getElementById("questionForm")["choice"].value;
  var id = gup("workerId");
  if(!id || id==="" || id.length===0){
    id = "DEBUG";
  }
  var questionNum = document.getElementById("questionForm")["questionId"].value;
  var r1 = document.getElementById("questionForm")["r1"].value;
  var r2 = document.getElementById("questionForm")["r2"].value;
  var x1 = document.getElementById("questionForm")["x1"].value;
  var x2 = document.getElementById("questionForm")["x2"].value;
  var y1 = document.getElementById("questionForm")["y1"].value;
  var y2 = document.getElementById("questionForm")["y2"].value;
  var stim = document.getElementById("questionForm")["stim"].value;
  var writeRequest = new XMLHttpRequest();
  var writeString = "data/write.php?workerId="+id+"&experiment="+experiment+"&condition="+condition+"&n="+questionNum+"&stim="+stim+"&answer="+answer+"&r1="+r1+"&r2="+r2+"&x1="+x1+"&x2="+x2+"&y1="+y1+"&y2="+y2+"&rt="+rt;
  writeRequest.open("GET",writeString);
  writeRequest.addEventListener("load",doneWrite);
  writeRequest.send();
}

/*function writeDemo(){
  var writeRequest = new XMLHttpRequest();
  var writeString = "data/demowrite.php?";
  writeRequest.open("GET",writeString);
  writeRequest.addEventListener("load",doneDemoWrite);
  writeRequest.send(); 
}
*/

function disableBtn(){
 if(gup('assignmentId')== "ASSIGNMENT_ID_NOT_AVAILABLE"){
   document.getElementById("rdyBtn").disabled = true;
   document.getElementById("rdyBtn").value = "PREVIEW MODE";
 }
 setTurkLink();
}

function setTurkLink(){
   document.getElementById("rdyLink").href+="?assignmentId="+gup('assignmentId')+"&workerId="+gup('workerId');
}

function setTurkValues(){
  document.getElementById("assignmentId").value= gup('assignmentId');
  document.getElementById("workerId").value=gup('workerId');
  var form = document.getElementById("mturk_form");
  if(document.referrer && (document.referrer.indexOf('workersandbox')!= -1)){
    form.action = "https://workersandbox.mturk.com/mturk/externalSubmit";
  }
}

function validateDemo(){
  window.parent.document.getElementById("submitButton").disabled = "false";
  //window.parent.document.getElementById("gender").value
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
  if(enabled){
    document.getElementById("questionForm")["choice"].value = -1;
    enabled = false;
    writeAnswer();  
  }
}

function clickRight(){
  if(enabled){
    document.getElementById("questionForm")["choice"].value = 1;
    enabled = false;
    writeAnswer();
  }
}
