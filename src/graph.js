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
    Tooltip
      .html('<u>' + d.className + '</u>')
      .style("left", (d3.mouse(this)[0] + 10) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
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
      createBarChart(d.methodMetrics);
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

function createBarChart(methodData) {
  console.log(methodData);
  // // set the dimensions and margins of the graph
  // var margin = { top: 20, right: 20, bottom: 30, left: 40 },
  //   width = 960 - margin.left - margin.right,
  //   height = 500 - margin.top - margin.bottom;

  // // set the ranges
  // var x = d3.scaleBand()
  //   .range([0, width])
  //   .padding(0.1);
  // var y = d3.scaleLinear()
  //   .range([height, 0]);

  // // append the svg object to the body of the page
  // // append a 'group' element to 'svg'
  // // moves the 'group' element to the top left margin
  // var svg = d3.select("#metric-chart").append("svg")
  //   .attr("width", width + margin.left + margin.right)
  //   .attr("height", height + margin.top + margin.bottom)
  //   .append("g")
  //   .attr("transform",
  //     "translate(" + margin.left + "," + margin.top + ")");


  // // // get the data
  // // if (error) throw error;

  // // // format the data
  // // data.forEach(function (d) {
  // //     d.sales = +d.sales;
  // // });

  // // Scale the range of the data in the domains
  // x.domain(data.map(function (d) { return d.methodName; }));
  // y.domain([0, d3.max(data, function (d) { return d.numLines; })]);

  // // append the rectangles for the bar chart
  // svg.selectAll(".bar")
  //   .data(data)
  //   .enter().append("rect")
  //   .attr("class", "bar")
  //   .attr("x", function (d) { return x(d.methodName); })
  //   .attr("width", x.bandwidth())
  //   .attr("y", function (d) { return y(d.numLines); })
  //   .attr("height", function (d) { return height - y(d.numLines); });

  // // add the x Axis
  // svg.append("g")
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(d3.axisBottom(x));

  // // add the y Axis
  // svg.append("g")
  //   .call(d3.axisLeft(y));
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