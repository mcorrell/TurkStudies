/*
 Code for Turk Experiments for analysis of "regression by eye"
 
 Exp1 : Slope Selection by trend type in scatterplots
  Three main factors:
      Linear trend
      Trigonometric trend
      Quadratic model

 Exp2 : Slope Selection by visualization type
    Three main factors:
      Scatterplot
      Line graph
      Area chart
 
 Exp3: Intercept Selection by visualization type
    Three main factors:
      Scatterplot
      Line graph
      Area chart
 
 
 */



var experiment = "Exp4";
var metadata;

var canvasW = 300;
var canvasH = 525;

var resolution = 50;
var slopeLine = [];

var questionNum = 0;
var questionMax = 0;

var svg;
var svgLine;
var startTime;
var stim;

var x = d3.scale.linear()
          .domain([0,1])
          .range([10,canvasW-10]);

var y = d3.scale.linear()
          .domain([0,1])
          .range([canvasH-122.5,122.5])
          .clamp(false);

var b = d3.scale.linear()
          .domain([-1,1])
          .range([1,0]);

var trig = d3.scale.linear()
            .domain([0,1])
            .range([0,1 * Math.PI]);

var trigy = d3.scale.linear()
              .domain([-1,1])
              .range([0,1]);

var lineFunc = d3.svg.line()
                .x(function(d) { return x(d.x);})
                .y(function(d) {return y(d.y);});

var main = d3.select("#fcontainer");

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


var workerId = gup("workerId");
if(!workerId){
  workerId = "UNKNOWN";
}

var assignmentId = gup("assignmentId");
if(!assignmentId){
  assignmentId = "";
}

function consent(){
  main.append("iframe")
  .attr("src","consent.html");
  
  var readyBtn = main.append("input")
  .attr("class","button")
  .attr("id","answer")
  .attr("name","answer")
  .attr("value","I Consent")
  .on("click",finishConsent);
  
  if(assignmentId=="ASSIGNMENT_ID_NOT_AVAILABLE"){
    readyBtn.attr("disabled","disabled");
    readyBtn.attr("value","PREVIEW");
  }
  
}

function finishConsent(){
  tutorial();
}

function  tutorial(){
  d3.select("iframe").attr("src","tutorial.html");
  d3.select("#answer")
    .attr("value","Ready")
    .on("click",finishTutorial);
}

function finishTutorial(){
  main.selectAll("#answer").remove();
  main.selectAll("iframe").remove();
  
  if(experiment=="Exp4"){
    d3.csv("data/"+experiment+"/metadata.csv", function(data){ metadata = data; task();});
  }
  else{
    task();
  }
}

function task(){
  //Create stimuli
  stim = genStim();
  
  //Question Info
  main.append("div")
  .attr("class","question")
  .html("Question <span id=\"questionNum\"></span>");
  
  //Main stim panel
  svg = main.append("svg")
    .style("width",canvasW)
    .style("height",canvasH);
  
  //Input
  main.append("input")
    .attr("class","slider")
    .attr("id","slope")
    .attr("name","slope")
    .attr("type","range")
    .attr("value","0")
    .attr("min","-1.00")
    .attr("max","1.00")
    .attr("step","0.01")
    .on("input",slope);
  
  main.append("input")
    .attr("class","button")
    .attr("id","answer")
    .attr("name","answer")
    .attr("value","Answer")
    .attr("disabled","disabled")
  .on("click",answer);
  
  //Instructions
  main.append("div")
    .attr("class","prompt")
    .html("Use the slider to adjust the line until it best matches the relationship of the points. <br /> Click the button above to confirm your answer.");
  
  //Set up Stimuli
  svg.append("svg:image").datum(stim[0])
    .attr("x",0)
    .attr("y",0)
    .attr("height",canvasH)
    .attr("width",canvasW)
    .attr("xlink:href",function(d){ return d.src;});
  svgLine = svg.append("path").attr("class","trend");
  
  initialize();
}

function makeSlope(m,yi){
  var xp;
  switch(stim[questionNum].type){
    case "trig":
      var bp = yi ? -1*yi/2.0 : 0.0;
      for(var i = 0;i<=resolution;i++){
        xp = i/resolution;
        yp = trigy(-1 * m*Math.cos(trig(xp)));
        slopeLine[i] = { "x": xp, "y": yp+parseFloat(bp)};
      }
    break;
    
    case "quad":
      var bp = yi ? b(m)-(yi/2.0) : b(m);
      for(var i = 0;i<=resolution;i++){
        xp = i/resolution;
        yp = ( m * xp * xp);
        if(m!=0){
          yp = ( m * xp * xp + parseFloat(bp));
        }
        else{
          yp = 0.5;
        }
        slopeLine[i] = { "x": xp, "y": yp};
      }
    break;
      
      
    default:
    case "linear":
      var bp = yi ? b(m)-(yi/2.0) : b(m);
      for(var i = 0;i<=resolution;i++){
        xp = i/resolution;
        yp = m*xp + parseFloat(bp);
        if(experiment=="Exp4" && stim[questionNum].ix && stim[questionNum].iy){
          yp= (m*(xp-stim[questionNum].ix))+(stim[questionNum].iy);
        }
        slopeLine[i] = { "x": xp, "y": yp};
      }
    break;
  }
}

function slope(){
  if(experiment=="Exp3"){
    makeSlope(parseFloat(stim[questionNum].m) * stim[questionNum].sign,this.value);
  }
  else{
    makeSlope(this.value);
  }
  svgLine.datum(slopeLine)
          .attr("d",lineFunc);
  
  
  d3.select("#answer").attr("disabled",null);
}

function initialize(){
  if(experiment=="Exp3"){
    makeSlope(parseFloat(stim[questionNum].m) * stim[questionNum].sign);
  }
  else{
    makeSlope(0);
  }
  svgLine.datum(slopeLine)
    .attr("d",lineFunc);
  d3.select("#slope").node().value = 0;
  d3.select("#questionNum").html((questionNum+1)+"/"+questionMax);
  d3.select("#answer").attr("disabled","true");
  svg.select("image").datum(stim[questionNum]).attr("xlink:href",function(d){ return d.src;}).attr("y",function(d){return y(d.offset)-y(0);});
  
  starttime = (new Date()).getTime();
  
}

function answer(){
  var rt = (new Date()).getTime() - startTime;
  var actual = experiment=="Exp3" ? parseFloat(stim[questionNum].offset) : parseFloat(stim[questionNum].sign)*stim[questionNum].m;
  var answer = experiment=="Exp3" ? -1*d3.select("#slope").node().value/2.0 : d3.select("#slope").node().value;
  var error = d3.format(".2f")(actual-answer);
  stim[questionNum].answer = answer;
  stim[questionNum].error = error;
  stim[questionNum].unsignedError = Math.abs(error);
  if(experiment=="Exp4"){
    stim[questionNum].errorActual = d3.format(".2f")(stim[questionNum].actualm - answer);
    stim[questionNum].unsignedErrorActual = Math.abs(stim[questionNum].errorActual);
  }
    console.log("Actual:" + actual + " Actual w/ outlier:" + stim[questionNum].actualm + " answered:"+answer + " error:"+error+" w/outlier error:"+stim[questionNum].errorActual);
  stim[questionNum].index = questionNum;
   writeAnswer();
}

function writeAnswer(){
  var writeRequest = new XMLHttpRequest();
  var writeString = "answer="+JSON.stringify(stim[questionNum]);
  //console.log(writeString);
  writeRequest.open("GET","data/writeJSON.php?"+writeString,true);
  writeRequest.setRequestHeader("Content-Type", "application/json");
  writeRequest.addEventListener("load",doneAnswer);
  writeRequest.send();
}

function doneAnswer(){
  //console.log(this.responseText);
  questionNum++;
  if(questionNum>=questionMax){
    finishTask();
  }
  else{
    initialize();
  }
  
}

function genStim(){
  var theStim = [];
  //slopes
  var ms = ["0.8","0.4","0.2","0.1"];
  //sign of slope
  var ss = ["-",""];
  
  var sigmas = ["0.05","0.1","0.15","0.2"];
  var types = experiment=="Exp4" ? ["line"] : ["line","trig","quad"];
  var graphtypes = (experiment=="Exp1" || experiment=="Exp4") ? ["scatter"] : ["scatter","area","line"];
  var outlierLocs = experiment=="Exp4" ? ["b","m","e"] : [""];
  var outlierNum = experiment=="Exp4" ? ["0","5","10","15"] : [""];
  
  var numValidation = 4;
  var i = 0;
  
  var numEachType = experiment=="Exp4" ? [0,0,0,0] : [0,0,0];
  var typeIndex;
  var numRegular = experiment=="Exp4" ? sigmas.length*ss.length*outlierLocs.length*outlierNum.length : graphtypes.length*ms.length*sigmas.length*ss.length;
  var maxOffset = experiment=="Exp3" ? 0.25 : 0;
  var name;
  var ndata;
  //Add blocked factors
  for(var graph of graphtypes){
    for(var sigma of sigmas){
      for(var s of ss){
        for(var ol of outlierLocs){
          for(var o of outlierNum){
            if(experiment=="Exp3"){
              //Type of fit now a random factor, rather than blocked:
              do{
                typeIndex = Math.floor(Math.random()*types.length);
              }while(numEachType[typeIndex]>(numRegular/3));
              type = types[typeIndex];
              numEachType[typeIndex]++;
            }
            else if(experiment=="Exp4"){
              //Slope now a random factor, rather than blocked:
              do{
                typeIndex = Math.floor(Math.random()*ms.length);
              }while(numEachType[typeIndex]>(numRegular/4));
              m = ms[typeIndex];
              numEachType[typeIndex]++;
              type = types[0];
            }
            else{
              type = types[0];
            }
            
            theStim[i] = {};
            theStim[i].sigma = sigma;
            theStim[i].sign = s=="-"? "-1":"1";
            theStim[i].type = type;
            theStim[i].m = m;
            name = "S"+sigma+"m"+s+m+"o"+ol+o+".png";
            theStim[i].src = "data/"+experiment+"/"+type+"/"+graph+"/"+name;
            theStim[i].isValidation = "false";
            theStim[i].id = workerId;
            theStim[i].graphtype = graph;
            theStim[i].offset = d3.format(".2f")((Math.random()*(2*maxOffset))-maxOffset);
            theStim[i].outlierLoc = ol;
            theStim[i].outlierNum = o;
            if(experiment=="Exp4" && o>0){
              ndata = metadata.find(function(n){ return n.id==name;});
            }
            theStim[i].ix = ndata ? parseFloat(ndata.ix) : 0;
            theStim[i].iy = ndata ? parseFloat(ndata.iy) : 0;
            theStim[i].actualm = ndata ? parseFloat(ndata.actualm) : theStim[i].sign*m;
            theStim[i].actualb = ndata ? parseFloat(ndata.actualb) : b(m);
            ndata = "";
            i++;
          }
        }
      }
    }
  }
  
  
  
  
  //Add validation stimuli
  for(var j = 0;j<numValidation;j++){
    type = types[Math.floor(Math.random()*types.length)];
    m = "1.0";
    sigma = sigmas[Math.floor(Math.random()*sigmas.length)];
    s = ss[Math.floor(Math.random()*ss.length)];
    graph = graphtypes[Math.floor(Math.random()*graphtypes.length)];
    theStim[i] = {};
    theStim[i].sigma = sigma;
    theStim[i].sign = s=="-"? "-1":"1";
    theStim[i].type = type;
    theStim[i].m = m;
    var ol = experiment=="Exp4" ? "b" : "";
    var o = experiment=="Exp4" ? "0" : "";
    name = "S"+sigma+"m"+s+m+"o"+ol+o+".png";
    theStim[i].src = "data/"+experiment+"/"+type+"/"+graph+"trend/"+name;
    theStim[i].isValidation = "true";
    theStim[i].id = workerId;
    theStim[i].graphtype = graph;
    theStim[i].offset = 0;
    theStim[i].outlierLoc = "b";
    theStim[i].outLierNum = "0";
    theStim[i].ix = 0;
    theStim[i].iy = 0;
    theStim[i].actualm = m;
    theStim[i].actualb = b(m);
    i++;
  }
  
  questionMax = i;
  dl.permute(theStim);
  return theStim;
}

function finishTask(){
  main.selectAll("*").remove();
  postTest();
}

function postTest(){
  var format = d3.format(".3f");
  var avgError = format(dl.mean(stim,"error"));
  var avgUError = format(dl.mean(stim,"unsignedError"));
  
  main.append("div")
    .html("Thank you for your participation!");
  
  main.append("div")
    .html("We will now ask for demographic information. You will also have the chance to give feedback.");
  
  
  form = main.append("form")
  .attr("id","mturk_form")
  .attr("method","post");
  
  if(document.referrer && (document.referrer.indexOf("workersandbox")!=-1)){
    form.attr("action","https://workersandbox.mturk.com/mturk/externalSubmit")
  }
  else{
    form.attr("action","https://www.mturk.com/mturk/externalSubmit");
  }
  
  form.append("input")
  .attr("type","hidden")
  .attr("name","experiment")
  .attr("value",experiment);
  
  form.append("input")
  .attr("type","hidden")
  .attr("name","assignmentId")
  .attr("value",assignmentId);
  
  form.append("input")
  .attr("type","hidden")
  .attr("name","workerId")
  .attr("value",workerId);
  
  form.append("input")
    .attr("type","hidden")
    .attr("name","error")
    .attr("value",avgError);
  
  form.append("input")
  .attr("type","hidden")
  .attr("name","uError")
  .attr("value",avgUError);
  
  var dlist = form.append("ol");
  
  var genders = ["Male","Female","Other","Decline to state"];
  var educations = ["Some high school","High school degree","Some college","College degree","Graduate degree"];
  var experiences = ["1. No experience","2.","3. Some experience","4.","5. A great deal of experience"];
  
  var genderQ = dlist.append("li").html("What is your gender <br />");
  
  for(var gender of genders){
    genderQ.append("input")
      .attr("type","radio")
      .attr("name","gender")
      .attr("value",gender);
    
    genderQ.append("span").html(gender +"<br />");
  }
  
  var eduQ = dlist.append("li").html("What is your highest level of education <br />");
  
  for(var education of educations){
    eduQ.append("input")
      .attr("type","radio")
      .attr("name","education")
      .attr("value",education);
    
    eduQ.append("span").html(education + "<br />");
  }
  
  var expQ = dlist.append("li").html("How do you rate your experience interpreting graphs and charts (1-5)? <br />");
  
  for(var i = 0;i<experiences.length;i++){
    expQ.append("input")
      .attr("type","radio")
      .attr("name","experience")
      .attr("value",i);
    
    expQ.append("span").html(experiences[i]+"<br />");
  }
  
  var ageQ = dlist.append("li").html("What is your age? <br />");
  ageQ.append("input")
    .attr("type","number")
    .attr("name","age")
    .attr("min","18")
    .attr("max","100");
  
  
  var commentQ = dlist.append("li").html("Any additional comments of feedback? <br />");
  
  commentQ.append("textarea")
    .attr("name","comments")
    .attr("rows","4")
    .attr("cols","50");
  
  
  form.append("input")
  .attr("id","turkBtn")
  .attr("type","submit")
  .attr("class","button")
  .attr("name","submit")
  .attr("value","Submit");
  
}

consent();

