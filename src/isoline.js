var canvasW = 400;
var canvasH = 400;

var svg = d3.select("svg")
            .style("width",canvasW)
            .style("height",canvasH);

var lanes = [0.2,0.4,0.6,0.8];

var laneW = 20;

var dots = [];
for(var i = 0;i<lanes.length;i++){
  dots.push({"x": lanes[i], "y": 0, "active": true});
  dots.push({"x": lanes[i], "y": 1, "active": true});
}

var stim = [{"src": "https://homes.cs.washington.edu/~mcorrell/images/logo.png"}]; 

var x = d3.scale.linear()
          .domain([0,1])
          .range([0,canvasW]);

var y = d3.scale.linear()
          .domain([0,1])
          .range([canvasH,0])
          .clamp(true);

var drag = d3.behavior.drag()
    .origin(function(d){ var t = d3.select(this); return {x: t.attr("cx"), y: t.attr("cy")};})
    .on("drag", dragmove);

svg.selectAll("image").data(stim).enter().append("svg:image")
   .attr("x",0)
   .attr("y",0)
   .attr("height",canvasH)
   .attr("width",canvasW)
   .attr("xlink:href",function(d){ return d.src;});

svg.selectAll("rect").data(lanes).enter().append("rect")
   .attr("x",function(d){ return x(d)-10+"px";})
   .attr("width",laneW+"px")
   .attr("height",canvasH+"px")
   .attr("y","0px")
   .classed("lane",true);

svg.selectAll("circle").data(dots).enter().append("circle")
   .attr("cx",function(d){ return x(d.x);})
   .attr("cy",function(d){ return y(d.y);})
   .attr("r", (laneW/4)+"px")
   .call(drag)
   .classed("active",function(d){ return d.active;});

function dragmove(d,i){
  // Move the point to a new location. If it is a "lower" point (index is even), then it 
  // is bounded above by its corresponding upper point, and vice versa (mutatis mutandis).
  // Should also update the y property, which should be in [0,1].
  var t = d3.select(this);
  var newY = Math.max(0,Math.min(1,y.invert(d3.event.y)));
  var opIndex = i%2==0 ? i+1 : i-1;
  var radius = 1- y.invert(parseFloat(t.attr("r")));
  radius*=2;
  var bound = d3.selectAll("circle").filter(function(d,i){ return i==opIndex;}).datum().y;
  bound = i%2==0 ? bound - radius : bound+radius;
  t.datum().y = i%2==0 ? Math.min(bound,newY) : Math.max(bound,newY);
  t.attr("cy",function(d){ return y(d.y);});
}
