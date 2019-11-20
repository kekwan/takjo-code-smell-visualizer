function create(error, classMetrics) {
  var data = classMetrics.data;
  createNetwork(data);
  //createBarChart(numericInfo);

};


function createNetwork(data) {
  var centerNode = {};
  centerNode.id = data.length + 1;
  data.push(centerNode);

  var links = createCenterLinks(data);

  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#network_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

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
    .attr("r", 20)
    .style("fill", "#69b3a2")

  // Let's list the force we wanna apply on the network
  var simulation = d3.forceSimulation(data)                   // Force algorithm is applied to data.nodes
    .force("link", d3.forceLink()                             // This force provides links between nodes
      .id(function (d) { return d.id; })                      // This provide  the id of a node
      .links(links)                                           // and this the list of links
      )
    .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
    .on("end", ticked);

  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    link
      .attr("x1", function (d) { 
        return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node
      .attr("cx", function (d) {
        return d.x + 6;
      })
      .attr("cy", function (d) { return d.y - 6; });
  }
}

function createBarChart(numericInfo) {
  data = numericInfo.data;
  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
  var y = d3.scaleLinear()
    .range([height, 0]);

  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#metric-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");


  // // get the data
  // if (error) throw error;

  // // format the data
  // data.forEach(function (d) {
  //     d.sales = +d.sales;
  // });

  // Scale the range of the data in the domains
  x.domain(data.map(function (d) { return d.methodName; }));
  y.domain([0, d3.max(data, function (d) { return d.numLines; })]);

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function (d) { return x(d.methodName); })
    .attr("width", x.bandwidth())
    .attr("y", function (d) { return y(d.numLines); })
    .attr("height", function (d) { return height - y(d.numLines); });

  // add the x Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g")
    .call(d3.axisLeft(y));
}

function createCenterLinks(data) {
  var links = [];
  for (var node of data) {
    var link = {};
    link.source = node.id;
    link.target = data.length;
    links.push(link);
  }
  console.log("123");
  return links;
}