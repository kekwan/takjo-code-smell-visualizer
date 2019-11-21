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
    // console.log(d3.mouse(this));
    // console.log(this);
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
      createBarChart(d);
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

function createBarChart(classData) {
  var methodMetrics = classData.methodMetrics;
  console.log(methodMetrics);
  $("#modalLongTitle").html("Method Metrics for" + classData.className);
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 20, left: 50 },
    width = 650 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#metric_charts")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Parse the Data
  d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_stacked.csv", function (data) {

    // List of subgroups = header of the csv files = soil condition here
    var subgroups = data.columns.slice(1)
    //console.log(subgroups);
    var metricSubGroups = ["numLines", "numParams", "maxNestedDepth", "lawOfDemter"];
    console.log(metricSubGroups);
    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(data, function (d) { return (d.group) }).keys()
    //console.log(groups);
    
    var methodNames = methodMetrics.map(method => method.methodName);
    console.log(methodNames);
    // Add X axis
    var x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSize(0));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 40])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Another scale for subgroup position?
    var xSubgroup = d3.scaleBand()
      .domain(subgroups)
      .range([0, x.bandwidth()])
      .padding([0.05])

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(['#e41a1c', '#377eb8', '#4daf4a'])

    // Show the bars
    svg.append("g")
      .selectAll("g")
      // Enter in data = loop group per group
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function (d) { return "translate(" + x(d.group) + ",0)"; })
      .selectAll("rect")
      .data(function (d) { 
        console.log(d);
        console.log(subgroups.map(function (key) { return { key: key, value: d[key] }; }));
        return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
      .enter().append("rect")
      .attr("x", function (d) {
        //console.log(d); 
        return xSubgroup(d.key); })
      .attr("y", function (d) { return y(d.value); })
      .attr("width", xSubgroup.bandwidth())
      .attr("height", function (d) { return height - y(d.value); })
      .attr("fill", function (d) { return color(d.key); });

  })

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