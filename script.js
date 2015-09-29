function ONAGraph() {
  // Default settings
  this.settings = {
    linkDistance: 50,
    charge: -120,
    showAllNames: false,
    oneNameIndex: 54
	};

    $('#show').on('click', this.renderGraph.bind(this));
    $('#showOneName').on('change', this.changeOneSettings.bind(this));


    this.renderGraph();
};

ONAGraph.prototype.changeOneSettings = function(e) {
    this.settings.oneNameIndex = $(e.currentTarget).val();
    console.log('changed to', this.settings.oneNameIndex );
}

ONAGraph.prototype.renderGraph = function() {
	console.log('Rendering...');
    var self = this;

    var width = window.innerWidth,
        height = window.innerHeight;

    var color = d3.scale.category20();



      function zoom() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }


    var force = d3.layout.force()
        .charge(this.settings.charge)
        .linkDistance(this.settings.linkDistance)
        .linkStrength(0.2)
        .size([width, height]);

    var svg = d3.select("#ona").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom));

    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
      .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");


    d3.json("sample-data/sample-data-from-surveymoney.json", function(error, graph) {
  if (error) throw error;

    force.nodes(graph.nodes)
      .links(graph.links)
      .start();

    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(1); })
            .attr("marker-end", "url(#end)");

    /*
        Draw each Node
    */
    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
          .attr("class", "node")
          .call(force.drag);

    // Draw node-circel
    node.append("circle")
      .attr("class", "node")
      .attr("r", function(d) {
            //console.log(d.index);
            //if (d.index == self.settings.oneNameIndex) {
            //    return 13;
            //}
            return 6;
       })
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);

    node.filter(function(d) {
            //console.log(d.index);
            if (d.index == self.settings.oneNameIndex) {
                return d;
            }
            //return d;
        })
        .append("text")
          .attr("dx", 12)
          .attr("dy", ".35em")
          .text(function(d) { return d.name });


    /*
    var node = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);*/

    node.append("title")
      .text(function(d) { return d.name + ' (' + d.group + ')'; });

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });


      function generateCoworkerSelect () {
          var $select = $('select');

          $.each(graph.nodes, function(i, v) {
              //console.log(i, v);
              $select.append('<option value="'+v.index+'">'+v.name+'</option>');
          });
      }

      generateCoworkerSelect();

    });
};

new ONAGraph();
