var canvasW = 300;
var canvasH = 525;

var resolution = 50;
var slopeLine = [];

var questionNum = 0;
var questionMax = 75;

var experiment = "Exp1";
var server = "https://homes.cs.washington.edu/~mcorrell/";

var svg = d3.select("svg")
            .style("width",canvasW)
            .style("height",canvasH);


var stim = genStim();

//var stim = [{"src": "https://homes.cs.washington.edu/~mcorrell/TurkStudies/Exp1/trig/scattertrend/S0.2m1.0.png", "type" : "trig"},
         //            {"src": "https://homes.cs.washington.edu/~mcorrell/TurkStudies/Exp1/line/scattertrend/S0.2m1.0.png", "type" : "line"}
         //   ];

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

svg.append("svg:image").datum(stim[0])
   .attr("x",0)
   .attr("y",0)
   .attr("height",canvasH)
   .attr("width",canvasW)
   .attr("xlink:href",function(d){ return d.src;});

d3.select("input").on("input",slope);


var svgLine = svg.append("path").attr("class","trend");

initialize();

d3.select("#submit").on("click",answer);

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
  
  d3.select("#submit").attr("disabled",null);
}

function initialize(){
  makeSlope(0);
  svgLine.datum(slopeLine)
    .attr("d",lineFunc);
  d3.select("input").node().value = 0;
  d3.select("#questionNum").html((questionNum+1)+"/"+questionMax);
  d3.select("#submit").attr("disabled","true");
  svg.select("image").datum(stim[questionNum]).attr("xlink:href",function(d){ return d.src;});
}

function answer(){
  var actual = parseFloat(stim[questionNum].sign+stim[questionNum].m);
  var answer = d3.select("input").node().value;
  var error = actual-answer;
  console.log("Actual:" + actual + " answered:"+answer + " error:"+error);
  stim[questionNum].answer = answer;
  stim[questionNum].error = error;
  stim[questionNum].unsignedError = Math.abs(error);
  stim[questionNum].index = questionNum;
  questionNum++;
  if(questionNum>=questionMax){
    finished();
  }
  else{
    initialize();
  }
}

function genStim(){
  var theStim = [];
  //slopes
  var ms = ["1.0","0.8","0.6","0.4","0.2"];
  //sign of slope
  var ss = ["-",""];
  
  var sigmas = ["0.05","0.1","0.15","0.2","0.25"];
  var types = ["line","trig","quad"];
  
  var numValidation = 5;
  
  var s,type,m,sigma;
  for(var i = 0;i<questionMax;i++){
    type = types[i%types.length];
    m = ms[i%ms.length];
    sigma = sigmas[i%sigmas.length];
    s = ss[Math.round(Math.random())];
    
    theStim[i] = {};
    theStim[i].sigma = sigma;
    theStim[i].sign = s;
    theStim[i].type = type;
    theStim[i].m = m;
    theStim[i].src = server+"TurkStudies/data/"+experiment+"/"+type+"/scatter/S"+sigma+"m"+s+m+".png";
  }
  
  dl.permute(theStim);
  return theStim;
}

function finished(){
  var format = d3.format(".3f");
  var avgError = format(dl.mean(stim,"error"));
  var avgUError = format(dl.mean(stim,"unsignedError"));
  d3.select("table").remove();
  var doneBox = d3.select("body").append("div").attr("class","stimulus").html("Thank you for your participation. <br /> Average error: "+avgError+"<br /> Average absolute error: "+avgUError+"<br />");
  doneBox.append("input").attr("class","button").attr("type","submit").attr("value","Done");
}


