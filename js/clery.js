( function(global) {
	/*
	 * Adapted from http://bl.ocks.org/3943967
	 */
	
	$(document).ready(function(){
		global.app = new App();
		global.app.init();
	});
	
	var App = function(){
		var graph = {},
			that = {
			
			
				init: function(){
					graph = new Graph(data["oregon"]);
				
				},
			
		
		};
	
	
	
	
		return that;
	};
	
	 // Creates a new graph on the page from the provided data
	var Graph = function(data){
		// used to track context within parseCrimeData, which is within map(), which doesn't track indices
		var crime_labels = ["arson", "assault", "burglary", "drugs", "liquor", "sexual_assault", "vehicle_theft", "weapons"],
			colors = ["#ffaf02", "#868686", "#8d7a0f", "#71b605", "#3546e9", "#9c2ee9", "#d1db29", "#ef2525"],
			current_crime = 0;
		// d3 vars
		var	num_layers = 8,
			num_samples = 6,
			margin = { top: 40, right: 10, bottom: 20, left: 30 },
			width = 1100 - margin.left - margin.right,
			height = 573 - margin.top - margin.bottom,
			stack = d3.layout.stack(),
			layers = stack(d3.range(num_layers).map(function() { return parseCrimeData(num_samples); })),
			yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
			yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); }),
			x = d3.scale.ordinal().domain(d3.range(2006, 2006 + num_samples)).rangeRoundBands([0, width], .08),
			y = d3.scale.linear().domain([0, yStackMax]).range([height, 0]),
			color = d3.scale.ordinal().domain([0, num_layers - 1]).range(colors),
			xAxis = d3.svg.axis().scale(x).tickSize(0).tickPadding(6).orient("bottom"),
			yAxis = d3.svg.axis().scale(y).tickSize(0).tickPadding(6).orient("left"),
			svg = d3.select("#graph").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom).append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
			layer = svg.selectAll(".layer").data(layers).enter().append("g").attr("class", "layer").style("fill", function(d, i) { return color(i); }),
			rect = layer.selectAll("rect").data(function(d){ return d; })
				.enter().append("rect")
				.attr("x", function(d) { return x(d.x); })
				.attr("y", height)
				.attr("width", x.rangeBand())
				.attr("height", 0);
			
		rect.transition()
    		.delay(function(d, i) { return i * 10; })
    		.attr("y", function(d) { return y(d.y0 + d.y); })
    		.attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });
		
		
		svg.append("g")
    		.attr("class", "x axis")
   			.attr("transform", "translate(0," + height + ")")
    		.call(xAxis);
    		
    	svg.append("g").attr("class", "y axis")
    		.call(yAxis).append("text")
    		.attr("transform", "rotate(-90)");

		d3.selectAll("input").on("change", change);
	
		function change() {
  			this.value === "grouped" ? transitionGrouped() :  transitionStacked();
  			// TODO add normalization option
		};
		
		function transitionGrouped() {
  			y.domain([0, yGroupMax]);
  			rect.transition()
      			.duration(500)
      			.delay(function(d, i) { return i * 10; })
      			.attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / num_layers * j; })
      			.attr("width", x.rangeBand() / num_layers)
    			.transition()
     			.attr("y", function(d) { return y(d.y); })
      			.attr("height", function(d) { return height - y(d.y); });
      		refreshAxis();
		};
		
		function transitionStacked() {
  			y.domain([0, yStackMax]);
  			rect.transition()
      			.duration(500)
      			.delay(function(d, i) { return i * 10; })
      			.attr("y", function(d) { return y(d.y0 + d.y); })
      			.attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
    			.transition()
      			.attr("x", function(d) { return x(d.x); })
      			.attr("width", x.rangeBand());
      		refreshAxis();
		};
		
		function refreshAxis(){
			d3.select(".axis.y").remove();
      		svg.append("g").attr("class", "y axis")
    			.call(yAxis).append("text")
    			.attr("transform", "rotate(-90)");
		}
		
		function parseCrimeData(samples, label){		
			var i, vals = [], label = crime_labels[current_crime];
			for(i = 0; i < samples; i++){
				vals[i] = { x: i + 2006, y: data[label][i] }
			}
			current_crime++;
			return vals;
		}
		
	};
	
	
	
		
	
}(this));
