// Constants
    var radius = 7.5,
    url = "/data";

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    var tFormat = d3.time.format("%Y-%m");
    var testData = JSON.parse(xmlHttp.responseText, function(key, value){
      if (key === "date") {
        return tFormat.parse(value);
      } else {
        return value
      }
    });

    var url = "/data"
    var data;
    d3.json(url, function(json) {
    data = dealWithSheet(json) 
    categories = findCategories(data);		
    categories.reverse();
    categories.push("none");
    categories.reverse();
    console.log(categories);
    chart = d3.select('#timeline');
    margin = {top: 10, left: 120, bottom: 30, right: 10};
    height = 300 - margin.top - margin.bottom; //inner height
    width = 600 - margin.left - margin.right;  // inner width

    display = d3.select('#display')
	.style('height', 175)
	.style('width', width + margin.left);

    chart = chart
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
      .append('g')
	.attr('class', 'innerChart')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    minDate = d3.min(data, function(obj){ return obj.date });
    maxDate = d3.max(data, function(obj){ return obj.date });

    //X axis
    tScale = d3.time.scale()
	.domain([minDate, maxDate])
	.range([10,width-10]);

    xAxis = d3.svg.axis()
	.scale(tScale)
	.orient("bottom")

    chart.append('g')
	.attr('class', 'x axis')
	.attr('transform', 'translate(0,' + height + ')')
	.call(xAxis);
       
    //Y axis
    catScale = d3.scale.ordinal()
	.domain(categories)
	.rangePoints([0, height - 15], .3);

    yAxis = d3.svg.axis()
	.scale(catScale)
	.orient('left')
	.innerTickSize(-width);

    chart.append('g')
	.attr('class', 'y axis')
	.call(yAxis); 

    //fun
    colors = d3.scale.category20()
	.domain(categories);
     //Binding data to graph

   var gEvents = chart.selectAll('.event')
	.data(data)
      .enter().append('g')
	.attr('class', 'event')
	.attr('onmouseover', 'eventSelected(this)')
	.attr('onmouseout', 'eventDeselected(this)');

   function addIssueCircle(select, event, issue) {
	 select.append('circle')
		.attr('r', radius)
		.attr('cy', catScale(issue))
		.attr('cx', tScale(event.date))
		.style('fill', colors(issue));
	}

    function addMainCircle(select, event) {
	select.append('circle')
		.attr('r', radius*2/3)
		.attr('cy', catScale('none'))
		.attr('cx', tScale(event.date));
    }

    function findAdjacent(event, issue) {
	var pos = categories.indexOf(issue);
	prev = categories[pos - 1];
	if (event.issues.indexOf(prev) != -1) {
		return prev;
	} else {
		return issue;
	}
 
    }

    gEvents.each(function (event, i) {
		select = d3.select(this);
		
		event.issues.forEach(function(issue){
		     if (categories.indexOf(issue) != -1) {
			     var x = tScale(event.date);
			     select.append('line')
				.attr('class', 'connector')
				.attr('x1', x)
				.attr('x2', x)
				.attr('y1', catScale(findAdjacent(event, issue)))
				.attr('y2', catScale(issue))
			     select.call(addIssueCircle, event, issue);
	             }
		});
	     select.call(addMainCircle, event);
	});

   function findCategories(data){ //given a list of event objects, return the top 3 categories
	existing = {};
	data.forEach(function(event) {
			event.issues.forEach(function(issue) {
				if (!(issue in existing)) {
					existing[issue] = 1;
				} else {
					existing[issue] += 1
				}
			});
	});
	var topThree = [];	
	Object.keys(existing).forEach(function(key){
		topThree.push([key, existing[key]]);
	});
	topThree.sort(function(a, b) {return b[1] - a[1];});
	topThree = topThree.slice(0,3);
	topThree = topThree.map(function(e) {return e[0];});
	return topThree;
}
	
    function eventSelected(e) {
	updateDisplay(e.__data__);
	grayOut(e);
    }

    function eventDeselected(e) {
	grayIn(e);
    }

    function updateDisplay(event) { // takes an event object and populates the display with it
	display.select('.title')
		.text(event.title);
	display.select('.body')
		.text("Lorem ipsum doloret sibi wub ipsum sed comericut");
	display.select('.issuebox')
		.style('color', colors(event.issues[0]));
	display.select('.author')
		.text('By nskelsey');
	var dateS = event.date.toDateString();
	dateS = dateS.substring(4);
	dateS = dateS.replace(/\s0/, ' ');
	dateS = dateS.substring(0,3) + '.' + dateS.substring(3);	
	
	display.select('.date')
		.text(dateS);
    }

    function grayOut(elem){
	var g = d3.select(elem)
		.attr('class', "event focus");
	chart.selectAll('.event:not(.focus)')
		.transition()
		.style('opacity', .5);
    }

    function grayIn(elem) {
	var g = d3.select(elem)
		.attr('class', 'event');
	chart.selectAll('.event')
		.transition()
		.style('opacity', 1)
    }
    

});
    function dealWithSheet(json) {
        console.log(json);
        table = json.table;        
        col_titles = [];
        for (var i = 0; i < table.cols.length; i++){
           col_titles.push(table.cols[i].label);
        }
        var tFormat = d3.time.format("%Y-%m");
        var events = []
        rows = table.rows;
        for (var i = 0; i < table.rows.length; i++){
            var event = {};
            for (var j = 0; j < col_titles.length; j++){
                var title = col_titles[j],
                val = rows[i].c[j].v; 
                if (title === "issues") {
                    val = val.split(',')
                }
                if (title === "date") {
                    val = tFormat.parse(val);
                }
                event[title] = val
            }
            events.push(event);
        } 
        return events;
    }


