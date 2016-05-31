var canvasW = 400;
var canvasH = 400;

var resolution = 50;
var slopeLine = [];

var questionNum = 0;
var questionMax = 40;

var svg = d3.select("svg")
            .style("width",canvasW)
            .style("height",canvasH);

var stim = [{"src": "https://homes.cs.washington.edu/~mcorrell/images/logo.png", "type" : "quad"}];

var x = d3.scale.linear()
          .domain([0,1])
          .range([0,canvasW]);

var y = d3.scale.linear()
          .domain([0,1])
          .range([canvasH,0])
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

svg.selectAll("image").data(stim).enter().append("svg:image")
   .attr("x",0)
   .attr("y",0)
   .attr("height",canvasH)
   .attr("width",canvasW)
   .attr("xlink:href",function(d){ return d.src;});

d3.select("input").on("input",slope);

d3.select("#questionNum").html((questionNum+1)+"/"+questionMax);

makeSlope(0);

var svgLine = svg.append("path")
                 .datum(slopeLine)
                  .attr("class","trend")
                  .attr("d", lineFunc);

d3.select("#submit").attr("disabled",null);

function makeSlope(m){
  var xp;
  switch(svg.selectAll("image").datum().type){
    case "trig":
      for(var i = 0;i<resolution;i++){
        xp = i/resolution;
        yp = trigy(-1 * m*Math.cos(trig(xp)));
        slopeLine[i] = { "x": xp, "y": yp};
      }
    break;
    
    case "quad":
      var bp = b(m);
      for(var i = 0;i<resolution;i++){
        xp = i/resolution;
        yp = ( m * xp * xp);
        if(m>0){
          yp = ( m * xp * xp + bp);
        }
        else if(m<0){
          yp = (m * xp * xp + bp);
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
 
      for(var i = 0;i<resolution;i++){
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
}


