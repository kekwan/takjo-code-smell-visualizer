function create(error, classMetrics) {
  createNetwork(classMetrics.data);
};


function createNetwork(data) {
  var centerNode = {};
  centerNode.id = data.length + 1;
  centerNode.classSize = 0;
  data.push(centerNode);

  var links = createCenterLinks(data);

  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  // Color palette for nodes
  var color = function (d) {
    // Center Neutral Node
    if (!d.hasOwnProperty("codeSmellScore")) {
      return "#858585";
      // Red Nodes
    } else if (d.codeSmellScore > 50) {
      return "#F96969";
      // Yellow Nodes
    } else if (d.codeSmellScore > 30) {
      return "#F9F069";
      // Green Nodes
    } else {
      return "#99F969";
    }
  }

  // Size scale for countries
  var size = d3.scaleLinear()
    .domain([0, 5000])
    .range([15, 55])  // circle will be between 15 and 120 px wide

  // append the svg object to the body of the page
  var svg = d3.select("#network_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // create a tooltip
  var Tooltip = d3.select("#network_graph")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("pointer-events", "none")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function (d) {
    console.log("mouse");
    Tooltip
      .html('<u>' + d.className + '</u>')
      .style("left", (d3.event.pageX + 5) + "px")
      .style("top", (d3.event.pageY - 5) + "px")
      .style("opacity", 1)
      .style("visibility", "visible")
  }

  var mouseleave = function (d) {
    Tooltip
      .style("opacity", 0)
      .style("visibility", "hidden")
  }

  // Initialize the links
  var link = svg
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .style("stroke", "#aaa")

  // Initialize the nodes
  var node = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", function (d) { return size(d.classSize) })
    .style("fill", function (d) { return color(d) })
    .on("mouseenter", mouseover)
    .on("mouseleave", mouseleave)
    .on("click", function (d) {
      createHorizontalBarChart(d);
      $(".modal").modal("show");
    })

  // Let's list the force we wanna apply on the network
  var simulation = d3.forceSimulation(data)                   // Force algorithm is applied to data.nodes
    .force("link", d3.forceLink()                             // This force provides links between nodes
      .id(function (d) { return d.id; })                      // This provide  the id of a node
      .links(links)                                           // and this the list of links
    )
    .force("charge", d3.forceManyBody().strength(-4000))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
    .on("end", ticked);

  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y });
  }
}

function createHorizontalBarChart(classData) {
  $("#noMethodAlert").hide();
  $("#modalLongTitle").html("Method Metrics for " + classData.className + ".java");
  $(".chart").empty();

  var methodMetrics = classData.methodMetrics;
  if (methodMetrics === undefined || methodMetrics.length == 0) {
    $("#noMethodAlert").show();
  }

  var data = transformBarChartData(methodMetrics);

  var chartWidth = 700,
    barHeight = 20,
    groupHeight = barHeight * data.series.length,
    gapBetweenGroups = 15,
    spaceForLabels = 150,
    spaceForLegend = 200;

  // Zip the series data together (first values, second values, etc.)
  var zippedData = [];
  for (var i = 0; i < data.labels.length; i++) {
    for (var j = 0; j < data.series.length; j++) {
      zippedData.push(data.series[j].values[i]);
    }
  }

  // Color scale
  var color = d3.scaleOrdinal(d3.schemeCategory20);
  var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

  var x = d3.scaleLinear()
    .domain([0, d3.max(zippedData)])
    .range([0, chartWidth]);

  var y = d3.scaleLinear()
    .range([chartHeight + gapBetweenGroups, 0]);

  var yAxis = d3.axisLeft(y);

  // Specify the chart area and dimensions
  var chart = d3.select(".chart")
    .attr("width", spaceForLabels + chartWidth + spaceForLegend)
    .attr("height", chartHeight);

  // Create bars
  var bar = chart.selectAll("g")
    .data(zippedData)
    .enter().append("g")
    .attr("transform", function (d, i) {
      return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i / data.series.length))) + ")";
    });

  // Create rectangles of the correct width
  bar.append("rect")
    .attr("fill", function (d, i) { return color(i % data.series.length); })
    .attr("class", "bar")
    .attr("width", x)
    .attr("height", barHeight - 1);

  // Add text label in bar
  bar.append("text")
    .attr("class", "bar-value")
    .attr("x", function (d) { return x(d) + 5; })
    .attr("y", barHeight / 2)
    .attr("fill", "red")
    .attr("dy", ".35em")
    .text(function (d) { return d; });

  // Draw labels
  bar.append("text")
    .attr("class", "label")
    .attr("x", function (d) { return - 10; })
    .attr("y", groupHeight / 2)
    .attr("dy", ".35em")
    .attr("fill", "blue")
    .text(function (d, i) {
      if (i % data.series.length === 0)
        return data.labels[Math.floor(i / data.series.length)];
      else
        return ""
    });

  chart.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups / 2 + ")")
    .call(yAxis);

  // Draw legend
  var legendRectSize = 18,
    legendSpacing = 4;

  var legend = chart.selectAll('.legend')
    .data(data.series)
    .enter()
    .append('g')
    .attr('transform', function (d, i) {
      var height = legendRectSize + legendSpacing;
      var offset = -gapBetweenGroups / 2;
      var horz = spaceForLabels + chartWidth + 70 - legendRectSize;
      var vert = i * height - offset;
      return 'translate(' + horz + ',' + vert + ')';
    });

  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', function (d, i) { return color(i); })
    .style('stroke', function (d, i) { return color(i); });

  legend.append('text')
    .attr('class', 'legend')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function (d) { return d.label; });
}

function transformBarChartData(methodMetrics) {
  var data = {};
  var methodNameLabels = methodMetrics.map(method => method.methodName);
  data.labels = methodNameLabels;

  var series = [];
  var numLinesValues = methodMetrics.map(method => method.numLines);
  series.push({ "label": "numLines", "values": numLinesValues });

  var numParamsValues = methodMetrics.map(method => method.numParams);
  series.push({ "label": "numParams", "values": numParamsValues });

  var maxNestedDepthValues = methodMetrics.map(method => method.maxNestedDepth);
  series.push({ "label": "maxNestedDepth", "values": maxNestedDepthValues });

  var lawOfDemeterValues = methodMetrics.map(method => method.lawOfDemeter);
  series.push({ "label": "LawOfDemeter", "values": lawOfDemeterValues });

  data.series = series;
  return data;
}


function createCenterLinks(data) {
  var links = [];
  for (var node of data) {
    var link = {};
    link.source = node.id;
    link.target = data.length;
    links.push(link);
  }
  return links;
}