var wave = "";
function showDetails (country) {
  var div = document.getElementById("show" + country);
  div.style.display = "block";
}
function closeDetails (val){
  var l = val.split("close");
  document.getElementById("show" + l[1]).style.display = "none";
}

var width = document.body.clientWidth,
    height = d3.max([document.body.clientHeight-540, 240]);

var m = [60, 0, 10, 0],
    w = width - m[1] - m[3],
    h = height - m[0] - m[2],
    xscale = d3.scale.ordinal().rangePoints([0, w], 1),
    yscale = {},
    dragging = {},
    line = d3.svg.line(),
    axis = d3.svg.axis().orient("left").ticks(1+height/50),
    data,
    foreground,
    background,
    highlighted,
    dimensions,
    legend,
    render_speed = 50,
    brush_count = 0,
    excluded_groups = [];

var colors = {
  "Africa": [0,85,55],
  "Asia": [82,39,39],
  "Central America": [243,100,50],
  "Europe": [180,100,50],
  "North America": [300,100,50],
  "Oceania": [60,100,50],
  "South America": [0,0,50],
  "Sample Average":[0,0,0]
};

// Scale chart and canvas height
d3.select("#chart")
    .style("height", (h + m[0] + m[2]) + "px")

d3.selectAll("canvas")
    .attr("width", w)
    .attr("height", h)
    .style("padding", m.join("px ") + "px");


// Foreground canvas for primary view
foreground = document.getElementById('foreground').getContext('2d');
foreground.globalCompositeOperation = "destination-over";
foreground.strokeStyle = "rgba(0,100,160,0.1)";
foreground.lineWidth = 0.8;
foreground.fillText("Set wave to start comparison.",w/2,h/2);

// Highlight canvas for temporary interactions
highlighted = document.getElementById('highlight').getContext('2d');
highlighted.strokeStyle = "rgba(0,100,160,1)";
highlighted.lineWidth = 4;

// Background canvas
background = document.getElementById('background').getContext('2d');
background.strokeStyle = "rgba(0,100,160,0.1)";
background.lineWidth = 1.7;

// SVG for ticks, labels, and interactions
var svg = d3.select("svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

function start() {
  var start = document.getElementById("start");
  var app = document.getElementById("app");
  start.style.display = "none";
  app.style.display = "block";
  filterWave('./95-99/data.csv');
}

function filterWave(val) {
  if (val == './95-99/data.csv'){
    document.getElementById("charttitle").innerHTML = "Wave selected for preview: 1995-1999";
    var val2 = './gapminder/95-99/gapminder95-99.csv'
    wave = "1995-1999";
  }
  else if (val == './00-04/data.csv'){
    document.getElementById("charttitle").innerHTML = "Wave selected for preview: 2000-2004";
    var val2 = './gapminder/00-04/gapminder00-04.csv'
    wave = "2000-2004";
  }
  else if (val == './05-09/data.csv'){
    document.getElementById("charttitle").innerHTML = "Wave selected for preview: 2005-2009";
    var val2 = './gapminder/05-09/gapminder05-09.csv'
    wave = "2005-2009";
  }
  else {
    document.getElementById("charttitle").innerHTML = "Wave selected for preview: 2010-2014";
    var val2 = './gapminder/10-14/gapminder10-14.csv'
    wave = "2010-2014";
  }
  /*var wave = "";
  console.log(wave);
  if (val2 == "./gapminder/95-99/gapminder95-99.csv") {
    wave = "1995-1999";
  }
  else if (val2 == "./gapminder/00-04/gapminder00-04.csv") {
    wave = "2000-2004";
  }
  else if (val2 == "./gapminder/05-09/gapminder05-09.csv") {
    wave = "2005-2009";
  }
  else (val2 == "./gapminder/10-14/gapminder10-14.csv") {
    wave = "2010-2014";
  }*/
  var canvas = document.getElementById("foreground");
  var context = canvas.getContext("2d");
  context.clearRect(0,0,canvas.width,canvas.height);
  d3.selectAll("g").remove();
  document.getElementById("legend").innerHTML = "";
  document.getElementById("country-list").innerHTML = "";
  document.getElementById("details").innerHTML = "";
  loadWave(val, val2);
  console.log(val);
}

function loadWave(val, val2) {

  var svg = d3.select("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
    .append("svg:g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
  // Load the data and visualization
  d3.csv(val, function(raw_data) {
    // Convert quantitative scales to floats
    data = raw_data.map(function(d) {
      for (var k in d) {
        if (!_.isNaN(raw_data[0][k] - 0) && k != 'id') {
          d[k] = parseFloat(d[k]) || 0;
        }
      };
      return d;
    });
    d3.csv(val2, function(data2) {

      var details = d3.select("#details")
        .selectAll("div")
        .data(data2)
        .enter()
        .append("div")
          .attr("id", function(d) {return "show" + d.country;})
          .style("display", "none")
          .style("border", "1px solid grey")
          .style("border-radius", "5px")
          .style("padding", "5px 5px 5px 5px")

      details.append("input")
        .attr("type", "button")
        .attr("value","X")
        .attr("id", function(d) { return "close" + d.country})
        .attr("onclick", "closeDetails(this.id)")

      details.append("p")
        .style("font-size", "9px")
        .style("color", "grey")
        .style("display","block")
        .style("float","right")
        .text(wave)

      details.append("h3")
        .text(function(d) {return d.country})
        .style("float","left")

      details.append("p")
        .text(function(d) {if (d.InternetUsers == "") {
                            return "Of population who used internet: NaN %"
                          } else{
                            return "Of population who used internet: " + d.InternetUsers + "%."}})

      details.append("p")
        .text(function(d) {if (d.LifeExpectancy == "") {
                            return "Life expectancy: NaN years."
                          } else{
                            return "Life expectancy: " + d.LifeExpectancy + " years."}})

      details.append("p")
        .text(function(d) {if (d.GDPPerCapita == "") {
                            return "GDP per capita: NaN international $."
                          } else{
                            return "GDP per capita: " + d.GDPPerCapita + " international $."}})

      details.append("p")
        .text(function(d) {if (d.HealthSpending == "") {
                            return "Government health spending per capita: NaN US$."
                          } else{
                            return "Government health spending per capita: " + d.HealthSpending + " US$."}})
      details.append("p")
        .text(function(d) {if (d.CO2Emissions == "") {
                          return "CO2 emissions: NaN tonnes per person."
                          } else{
                            return "CO2 emissions: " + d.CO2Emissions + " tonnes per person."}})
      details.append("p")
        .text(function(d) {if (d.LabourForceParticipation == "") {
                            return "Labour force participation: NaN %."
                          } else{
                            return "Labour force participation: " + d.LabourForceParticipation + " %."}})

     details.append("p")
      .text(function(d) {if (d.DeadKidsPerWoman == "") {
                          return "Dead children per woman: NaN children."
                        } else{
                          return "Dead children per woman: " + d.DeadKidsPerWoman + " children."}})

    });

    // Extract the list of numerical dimensions and create a scale for each.
    xscale.domain(dimensions = d3.keys(data[0]).filter(function(k) {
      return (_.isNumber(data[0][k])) && (yscale[k] = d3.scale.linear()
        .domain(d3.extent(data, function(d) { return +d[k]; }))
        .range([h, 0]));
    }).sort());

    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
        .data(dimensions)
      .enter().append("svg:g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
        .call(d3.behavior.drag()
          .on("dragstart", function(d) {
            dragging[d] = this.__origin__ = xscale(d);
            this.__dragged__ = false;
            d3.select("#foreground").style("opacity", "0.35");
          })
          .on("drag", function(d) {
            dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
            dimensions.sort(function(a, b) { return position(a) - position(b); });
            xscale.domain(dimensions);
            g.attr("transform", function(d) { return "translate(" + position(d) + ")"; });
            brush_count++;
            this.__dragged__ = true;

            // Feedback for axis deletion if dropped
            if (dragging[d] < 12 || dragging[d] > w-12) {
              d3.select(this).select(".background").style("fill", "#b00");
            } else {
              d3.select(this).select(".background").style("fill", null);
            }
          })
          .on("dragend", function(d) {
            if (!this.__dragged__) {
              // no movement, invert axis
              var extent = invert_axis(d);

            } else {
              // reorder axes
              d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");

              var extent = yscale[d].brush.extent();
            }

            // remove axis if dragged all the way left
            if (dragging[d] < 12 || dragging[d] > w-12) {
              remove_axis(d,g);
            }

            // TODO required to avoid a bug
            xscale.domain(dimensions);
            update_ticks(d, extent);

            // rerender
            d3.select("#foreground").style("opacity", null);
            brush();
            delete this.__dragged__;
            delete this.__origin__;
            delete dragging[d];
          }))
    /*var dimensions = [
      {
        name: "name",
        scale: d3.scale.ordinal().rangePoints([0, height]),
        type: "string"
      }]*/

    // Add an axis and title.
    g.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(0,0)")
        .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
      .append("svg:text")
        .attr("text-anchor", "middle")
        .attr("y", function(d,i) { return i%2 == 0 ? -14 : -30 } )
        .attr("x", 0)
        .attr("width", 1)
        .attr("class", "label")
        .text(String)
        .append("title")
          .text("Click to invert. Drag to reorder");

    // Add and store a brush for each axis.
    g.append("svg:g")
        .attr("class", "brush")
        .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
      .selectAll("rect")
        .style("visibility", null)
        .attr("x", -23)
        .attr("width", 36)
        .append("title")
          .text("Drag up or down to brush along this axis");

    g.selectAll(".extent")
        .append("title")
          .text("Drag or resize this filter");


    legend = create_legend(colors,brush);

    // Render full foreground
    brush();

  })
}

// copy one canvas to another, grayscale
function gray_copy(source, target) {
  var pixels = source.getImageData(0,0,w,h);
  target.putImageData(grayscale(pixels),0,0);
}

// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
function grayscale(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

function create_legend(colors,brush) {
  // create legend
  var legend_data = d3.select("#legend")
    .html("")
    .selectAll(".row")
    .data( _.keys(colors).sort() )

  // filter by group
  var legend = legend_data
    .enter().append("div")
      .attr("title", "Hide group")
      .on("click", function(d) {
        // toggle food group
        if (_.contains(excluded_groups, d)) {
          d3.select(this).attr("title", "Hide group")
          excluded_groups = _.difference(excluded_groups,[d]);
          brush();
        } else {
          d3.select(this).attr("title", "Show group")
          excluded_groups.push(d);
          brush();
        }
      });

  legend
    .append("span")
    .style("background", function(d,i) { return color(d,0.85)})
    .attr("class", "color-bar");

  legend
    .append("span")
    .attr("class", "tally")
    .text(function(d,i) { return 0});

  legend
    .append("span")
    .text(function(d,i) { return " " + d});

  return legend;
}

// render polylines i to i+render_speed
function render_range(selection, i, max, opacity) {
  selection.slice(i,max).forEach(function(d) {
    path(d, foreground, color(d.group,opacity));
  });
};

// simple data table
function data_table(sample) {
  // sort by first column
  var sample = sample.sort(function(a,b) {
    var col = d3.keys(a)[0];
    return a[col] < b[col] ? -1 : 1;
  });

  var table = d3.select("#country-list")
    .html("")
    .selectAll(".row")
      .data(sample)
    .enter().append("div")
      .attr("id", function(d) { return d.name})
      .on("click", function (d){
        showDetails(d.name)
      })
      .on("mouseover", highlight)
      .on("mouseout", unhighlight);

  table
    .append("span")
      .attr("class", "color-block")
      .style("background", function(d) { return color(d.group,0.85) })

  table
    .append("span")
      .text(function(d) { return d.name; })
      .append("title").text("hej")
}

// Adjusts rendering speed
function optimize(timer) {
  var delta = (new Date()).getTime() - timer;
  render_speed = Math.max(Math.ceil(render_speed * 30 / delta), 8);
  render_speed = Math.min(render_speed, 300);
  return (new Date()).getTime();
}

// Feedback on rendering progress
function render_stats(i,n,render_speed) {
  d3.select("#rendered-count").text(i);
  d3.select("#rendered-bar")
    .style("width", (100*i/n) + "%");
  d3.select("#render-speed").text(render_speed);
}

// Feedback on selection
function selection_stats(opacity, n, total) {
  d3.select("#data-count").text(total);
  d3.select("#selected-count").text(n);
  d3.select("#selected-bar").style("width", (100*n/total) + "%");
  d3.select("#opacity").text((""+(opacity*100)).slice(0,4) + "%");
}

// Highlight single polyline
function highlight(d) {
  d3.select("#foreground").style("opacity", "0.25");
  d3.selectAll(".row").style("opacity", function(p) { return (d.group == p) ? null : "0.3" });
  path(d, highlighted, color(d.group,1));
}

// Remove highlight
function unhighlight() {
  d3.select("#foreground").style("opacity", null);
  d3.selectAll(".row").style("opacity", null);
  highlighted.clearRect(0,0,w,h);
}

function invert_axis(d) {
  // save extent before inverting
  if (!yscale[d].brush.empty()) {
    var extent = yscale[d].brush.extent();
  }
  if (yscale[d].inverted == true) {
    yscale[d].range([h, 0]);
    d3.selectAll('.label')
      .filter(function(p) { return p == d; })
      .style("text-decoration", null);
    yscale[d].inverted = false;
  } else {
    yscale[d].range([0, h]);
    d3.selectAll('.label')
      .filter(function(p) { return p == d; })
      .style("text-decoration", "underline");
    yscale[d].inverted = true;
  }
  return extent;
}

// Draw a single polyline
/*
function path(d, ctx, color) {
  if (color) ctx.strokeStyle = color;
  var x = xscale(0)-15;
      y = yscale[dimensions[0]](d[dimensions[0]]);   // left edge
  ctx.beginPath();
  ctx.moveTo(x,y);
  dimensions.map(function(p,i) {
    x = xscale(p),
    y = yscale[p](d[p]);
    ctx.lineTo(x, y);
  });
  ctx.lineTo(x+15, y);                               // right edge
  ctx.stroke();
}
*/

function path(d, ctx, color) {
  if (color) ctx.strokeStyle = color;
  ctx.beginPath();
  var x0 = xscale(0)-15,
      y0 = yscale[dimensions[0]](d[dimensions[0]]);   // left edge
  ctx.moveTo(x0,y0);
  dimensions.map(function(p,i) {
    var x = xscale(p),
        y = yscale[p](d[p]);
    var cp1x = x - 0.88*(x-x0);
    var cp1y = y0;
    var cp2x = x - 0.12*(x-x0);
    var cp2y = y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    x0 = x;
    y0 = y;
  });
  ctx.lineTo(x0+15, y0);                               // right edge
  ctx.stroke();
};


function color(d,a) {
  if (d === "North America") {
    var c = "#FF0000"
  }
  if (d === "Europe") {
    var c = "#008000"
  }
  if (d === "Africa") {
    var c = "#0000FF"
  }
  if (d === "South America") {
    var c = "#FFFF00"
  }
  if (d === "Central America") {
    var c = "#FF00FF"
  }
  if (d === "Asia") {
    var c = "#00FFFF"
  }
  if (d === "Oceania") {
    var c = "#984ea3"
  }
  if (d === "Sample Average") {
    var c = "#666666"
  }
  //var c = colors[d];
  return c;
}

function position(d) {
  var v = dragging[d];
  return v == null ? xscale(d) : v;
}

// Handles a brush event, toggling the display of foreground lines.
// TODO refactor
function brush() {
  brush_count++;
  var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
      extents = actives.map(function(p) { return yscale[p].brush.extent(); });

  // hack to hide ticks beyond extent
  var b = d3.selectAll('.dimension')[0]
    .forEach(function(element, i) {
      var dimension = d3.select(element).data()[0];
      if (_.include(actives, dimension)) {
        var extent = extents[actives.indexOf(dimension)];
        d3.select(element)
          .selectAll('text')
          .style('font-weight', 'bold')
          .style('font-size', '13px')
          .style('display', function() {
            var value = d3.select(this).data();
            return extent[0] <= value && value <= extent[1] ? null : "none"
          });
      } else {
        d3.select(element)
          .selectAll('text')
          .style('font-size', null)
          .style('font-weight', null)
          .style('display', null);
      }
      d3.select(element)
        .selectAll('.label')
        .style('display', null);
    });
    ;

  // bold dimensions with label
  d3.selectAll('.label')
    .style("font-weight", function(dimension) {
      if (_.include(actives, dimension)) return "bold";
      return null;
    });

  // Get lines within extents
  var selected = [];
  data
    .filter(function(d) {
      return !_.contains(excluded_groups, d.group);
    })
    .map(function(d) {
      return actives.every(function(p, dimension) {
        return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1];
      }) ? selected.push(d) : null;
    });

  // free text search
  var query = d3.select("#search")[0][0].value;
  if (query.length > 0) {
    selected = search(selected, query);
  }

  if (selected.length < data.length && selected.length > 0) {
    d3.select("#keep-data").attr("disabled", null);
    d3.select("#exclude-data").attr("disabled", null);
  } else {
    d3.select("#keep-data").attr("disabled", "disabled");
    d3.select("#exclude-data").attr("disabled", "disabled");
  };

  // total by food group
  var tallies = _(selected)
    .groupBy(function(d) { return d.group; })

  // include empty groups
  _(colors).each(function(v,k) { tallies[k] = tallies[k] || []; });

  legend
    .style("text-decoration", function(d) { return _.contains(excluded_groups,d) ? "line-through" : null; })
    .attr("class", function(d) {
      return (tallies[d].length > 0)
           ? "row"
           : "row off";
    });

  legend.selectAll(".color-bar")
    .style("width", function(d) {
      return Math.ceil(600*tallies[d].length/data.length) + "px"
    });

  legend.selectAll(".tally")
    .text(function(d,i) { return tallies[d].length });

  // Render selected lines
  paths(selected, foreground, brush_count, true);
}

// render a set of polylines on a canvas
function paths(selected, ctx, count) {
  var n = selected.length,
      i = 0,
      opacity = d3.min([2/Math.pow(n,0.3),1]),
      timer = (new Date()).getTime();

  selection_stats(opacity, n, data.length)

  shuffled_data = _.shuffle(selected);

  data_table(shuffled_data.slice(0,25));

  ctx.clearRect(0,0,w+1,h+1);

  // render all lines until finished or a new brush event
  function animloop(){
    if (i >= n || count < brush_count) return true;
    var max = d3.min([i+render_speed, n]);
    render_range(shuffled_data, i, max, opacity);
    render_stats(max,n,render_speed);
    i = max;
    timer = optimize(timer);  // adjusts render_speed
  };

  d3.timer(animloop);
}

// transition ticks for reordering, rescaling and inverting
function update_ticks(d, extent) {
  // update brushes
  if (d) {
    var brush_el = d3.selectAll(".brush")
        .filter(function(key) { return key == d; });
    // single tick
    if (extent) {
      // restore previous extent
      brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).extent(extent).on("brush", brush));
    } else {
      brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush));
    }
  } else {
    // all ticks
    d3.selectAll(".brush")
      .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
  }

  brush_count++;

  show_ticks();

  // update axes
  d3.selectAll(".axis")
    .each(function(d,i) {
      // hide lines for better performance
      d3.select(this).selectAll('line').style("display", "none");

      // transition axis numbers
      d3.select(this)
        .transition()
        .duration(720)
        .call(axis.scale(yscale[d]));

      // bring lines back
      d3.select(this).selectAll('line').transition().delay(800).style("display", null);

      d3.select(this)
        .selectAll('text')
        .style('font-weight', null)
        .style('font-size', null)
        .style('display', null);
    });
}

// Rescale to new dataset domain
function rescale() {
  // reset yscales, preserving inverted state
  dimensions.forEach(function(d,i) {
    if (yscale[d].inverted) {
      yscale[d] = d3.scale.linear()
          .domain(d3.extent(data, function(p) { return +p[d]; }))
          .range([0, h]);
      yscale[d].inverted = true;
    } else {
      yscale[d] = d3.scale.linear()
          .domain(d3.extent(data, function(p) { return +p[d]; }))
          .range([h, 0]);
    }
  });

  update_ticks();

  // Render selected data
  paths(data, foreground, brush_count);
}

// Get polylines within extents
function actives() {
  var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
      extents = actives.map(function(p) { return yscale[p].brush.extent(); });

  // filter extents and excluded groups
  var selected = [];
  data
    .filter(function(d) {
      return !_.contains(excluded_groups, d.group);
    })
    .map(function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? selected.push(d) : null;
  });

  // free text search
  var query = d3.select("#search")[0][0].value;
  if (query > 0) {
    selected = search(selected, query);
  }

  return selected;
}

// Export data
function export_csv() {
  var keys = d3.keys(data[0]);
  var rows = actives().map(function(row) {
    return keys.map(function(k) { return row[k]; })
  });
  var csv = d3.csv.format([keys].concat(rows)).replace(/\n/g,"<br/>\n");
  var styles = "<style>body { font-family: sans-serif; font-size: 12px; }</style>";
  window.open("text/csv").document.write(styles + csv);
}

// scale to window size
window.onresize = function() {
  width = document.body.clientWidth,
  height = d3.max([document.body.clientHeight-500, 220]);

  w = width - m[1] - m[3],
  h = height - m[0] - m[2];

  d3.select("#chart")
      .style("height", (h + m[0] + m[2]) + "px")

  d3.selectAll("canvas")
      .attr("width", w)
      .attr("height", h)
      .style("padding", m.join("px ") + "px");

  d3.select("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
    .select("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  xscale = d3.scale.ordinal().rangePoints([0, w], 1).domain(dimensions);
  dimensions.forEach(function(d) {
    yscale[d].range([h, 0]);
  });

  d3.selectAll(".dimension")
    .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
  // update brush placement
  d3.selectAll(".brush")
    .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
  brush_count++;

  // update axis placement
  axis = axis.ticks(1+height/50),
  d3.selectAll(".axis")
    .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); });

  // render data
  brush();
};

// Remove all but selected from the dataset
function keep_data() {
  new_data = actives();
  if (new_data.length == 0) {
    alert("I don't mean to be rude, but I can't let you remove all the data.\n\nTry removing some brushes to get your data back. Then click 'Keep' when you've selected data you want to look closer at.");
    return false;
  }
  data = new_data;
  rescale();
}

// Exclude selected from the dataset
function exclude_data() {
  new_data = _.difference(data, actives());
  if (new_data.length == 0) {
    alert("I don't mean to be rude, but I can't let you remove all the data.\n\nTry selecting just a few data points then clicking 'Exclude'.");
    return false;
  }
  data = new_data;
  rescale();
}

function remove_axis(d,g) {
  dimensions = _.difference(dimensions, [d]);
  xscale.domain(dimensions);
  g.attr("transform", function(p) { return "translate(" + position(p) + ")"; });
  g.filter(function(p) { return p == d; }).remove();
  update_ticks();
}

d3.select("#keep-data").on("click", keep_data);
d3.select("#exclude-data").on("click", exclude_data);
d3.select("#export-data").on("click", export_csv);
d3.select("#search").on("keyup", brush);


// Appearance toggles
d3.select("#hide-ticks").on("click", hide_ticks);
d3.select("#show-ticks").on("click", show_ticks);
d3.select("#dark-theme").on("click", dark_theme);
d3.select("#light-theme").on("click", light_theme);

function hide_ticks() {
  d3.selectAll(".axis g").style("display", "none");
  //d3.selectAll(".axis path").style("display", "none");
  d3.selectAll(".background").style("visibility", "hidden");
  d3.selectAll("#hide-ticks").attr("disabled", "disabled");
  d3.selectAll("#show-ticks").attr("disabled", null);
};

function show_ticks() {
  d3.selectAll(".axis g").style("display", null);
  //d3.selectAll(".axis path").style("display", null);
  d3.selectAll(".background").style("visibility", null);
  d3.selectAll("#show-ticks").attr("disabled", "disabled");
  d3.selectAll("#hide-ticks").attr("disabled", null);
};

function dark_theme() {
  d3.select("body").attr("class", "dark");
  d3.selectAll("#dark-theme").attr("disabled", "disabled");
  d3.selectAll("#light-theme").attr("disabled", null);
}

function light_theme() {
  d3.select("body").attr("class", null);
  d3.selectAll("#light-theme").attr("disabled", "disabled");
  d3.selectAll("#dark-theme").attr("disabled", null);
}

function search(selection,str) {
  pattern = new RegExp(str,"i")
  return _(selection).filter(function(d) { return pattern.exec(d.name); });
}
