var experiment = "Exp1";
var server = "https://homes.cs.washington.edu/~mcorrell/TurkStudies/";

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
          .clamp(true);

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
  .style("width","100%")
  .style("height","90%")
  .attr("src",server+"consent.html");
  
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
  main.selectAll("#answer").remove();
  main.selectAll("iframe").remove();
  task();
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

function makeSlope(m){
  var xp;
  switch(svg.selectAll("image").datum().type){
    case "trig":
      for(var i = 0;i<=resolution;i++){
        xp = i/resolution;
        yp = trigy(-1 * m*Math.cos(trig(xp)));
        slopeLine[i] = { "x": xp, "y": yp};
      }
    break;
    
    case "quad":
      var bp = b(m);
      for(var i = 0;i<=resolution;i++){
        xp = i/resolution;
        yp = ( m * xp * xp);
        if(m!=0){
          yp = ( m * xp * xp + bp);
        }
        else{
          yp = 0.5;
        }
        slopeLine[i] = { "x": xp, "y": yp};
      }
    break;
      
      
    default:
    case "linear":
      var bp = b(m);
 
      for(var i = 0;i<=resolution;i++){
        xp = i/resolution;
        yp = m*xp + bp;
        slopeLine[i] = { "x": xp, "y": yp};
      }
    break;
  }
}

function slope(){
  makeSlope(this.value);
  svgLine.datum(slopeLine)
          .attr("d",lineFunc);
  
  d3.select("#answer").attr("disabled",null);
}

function initialize(){
  makeSlope(0);
  svgLine.datum(slopeLine)
    .attr("d",lineFunc);
  d3.select("#slope").node().value = 0;
  d3.select("#questionNum").html((questionNum+1)+"/"+questionMax);
  d3.select("#answer").attr("disabled","true");
  svg.select("image").datum(stim[questionNum]).attr("xlink:href",function(d){ return d.src;});
  starttime = (new Date()).getTime();
}

function answer(){
  var rt = (new Date()).getTime() - startTime;
  var actual = parseFloat(stim[questionNum].sign+stim[questionNum].m);
  var answer = d3.select("#slope").node().value;
  var error = d3.format(".2f")(actual-answer);
  console.log("Actual:" + actual + " answered:"+answer + " error:"+error);
  stim[questionNum].answer = answer;
  stim[questionNum].error = error;
  stim[questionNum].unsignedError = Math.abs(error);
  stim[questionNum].index = questionNum;
  writeAnswer();
}

function writeAnswer(){
  var writeRequest = new XMLHttpRequest();
  var writeString = "answer="+JSON.stringify(stim[questionNum]);
  writeRequest.open("POST",server+"data/writeJSON.php");
  writeRequest.addEventListener("load",doneAnswer);
  writeRequest.send(writeString);
}

function doneAnswer(){
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
  var types = ["line","trig","quad"];
  
  var numValidation = 4;
  var s,type,m,sigma;
  var i = 0;
  
  for(let type of types){
    for(let m of ms){
      for(let sigma of sigmas){
        for(let s of ss){
          theStim[i] = {};
          theStim[i].sigma = sigma;
          theStim[i].sign = s;
          theStim[i].type = type;
          theStim[i].m = m;
          theStim[i].src = server+"data/"+experiment+"/"+type+"/scatter/S"+sigma+"m"+s+m+".png";
          theStim[i].isValidation = false;
          i++;
        }
        }
    }
  }
  
  for(var j = 0;j<numValidation;j++){
    type = types[Math.floor(Math.random()*types.length)];
    m = "1.0";
    sigma = sigmas[Math.floor(Math.random()*sigmas.length)];
    s = ss[Math.floor(Math.random()*ss.length)];
    theStim[i] = {};
    theStim[i].sigma = sigma;
    theStim[i].sign = s;
    theStim[i].type = type;
    theStim[i].m = m;
    theStim[i].src = server+"data/"+experiment+"/"+type+"/scattertrend/S"+sigma+"m"+s+m+".png";
    theStim[i].isValidation = true;
    theStim[i].id = workerId;
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
  
  for(let gender of genders){
    genderQ.append("input")
      .attr("type","radio")
      .attr("name","gender")
      .attr("value",gender);
    
    genderQ.append("span").html(gender +"<br />");
  }
  
  var eduQ = dlist.append("li").html("What is your highest level of education <br />");
  
  for(let education of educations){
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

