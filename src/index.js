function create(error, numericInfo) {
    // set the dimensions and margins of the graph
    var width = 1000;
    var height = 800;

    // set the thresholds for code smell metrics
    var numLinesPerMethod = 0;
    var numParamsPerMethod = 0;
    var numUnusedMethods = 0;
    var numComplexMethods = 0;
    var numLawOfDemeterMethods = 0;

    // append the svg object to the body of the page
    var svg = d3.select("#bubble_chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Filter a bit the data -> more than 1 million inhabitants
    data = numericInfo.data;
    console.log(data);
    // Color palette for continents?
    var color = d3.scaleOrdinal()
        .domain([0, 500])
        .range(["green", "yellow", "red"]);

    // Size scale for countries
    var size = d3.scaleLinear()
        .domain([0, 500])
        .range([15, 120])  // circle will be between 15 and 120 px wide

    // create a tooltip
    var Tooltip = d3.select("#bubble_chart")
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
        .text("a simple tooltip");
    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        Tooltip
            .style("opacity", 1)
            .style("visibility", "visible")
    }
    var mousemove = function (d) {
        Tooltip
            .html('<u>' + d.methodName + '</u>')
            .style("left", (d3.mouse(this)[0] + 20) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function (d) {
        Tooltip
            .style("opacity", 0)
    }

    // Initialize the circle: all located at the center of the svg area
    var node = svg.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", function (d) { return size(d.numLines) })
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .style("fill", function (d) { return color(d.numLines) })
        .style("fill-opacity", 0.8)
        .attr("stroke", "black")
        .style("stroke-width", 1)
        .on("mouseover", mouseover) // What to do when hovered
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", function(d) {
            console.log(d);
            console.log(d3.select(this));
        })
        .call(d3.drag() // call specific function when circle is dragged
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Features of the forces applied to the nodes:
    var simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
        .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(.2).radius(function (d) { return (size(d.numLines) + 3) }).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
        .nodes(data)
        .on("tick", function (d) {
            node
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
        });

    // What happens when a circle is dragged?
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(.03).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(.03);
        d.fx = null;
        d.fy = null;
    }
};
