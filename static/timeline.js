function timelineWidget() {
    // Constants
    var radius = 7.5,
    url = "/data",
    margin = {top: 10, left: 120, bottom: 30, right: 10},
    height = 300,
    width = 700;

    // The root selection of this chart. needed for callbacks and my sanity
    var root;

    function chart(selection) {
        root = selection;
        var display = root.select(".display")
            .attr('class', 'display')
            .style('height', 175)
            .style('width', width);
        // does nothing for now
        var svg = selection.append("svg");

        svg.attr("width", width)
           .attr("height", height);
        
        innerWidth = width - margin.left - margin.right;
        innerHeight = height - margin.top - margin.bottom;

        console.log(svg);
        console.log(data)

        categories = findCategories(data);		
        categories.reverse();
        categories.push("none");
        categories.reverse();
        console.log(categories);

        innerChart = svg.append('g')
            .attr('class', 'innerChart')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        minDate = d3.min(data, function(obj){ return obj.date });
        maxDate = d3.max(data, function(obj){ return obj.date });

        //X axis
        tScale = d3.time.scale()
            .domain([minDate, maxDate])
            .range([10,innerWidth-10]);

        xAxis = d3.svg.axis()
            .scale(tScale)
            .orient("bottom");

        innerChart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + innerHeight + ')')
            .call(xAxis);

        //Y axis
        catScale = d3.scale.ordinal()
            .domain(categories)
            .rangePoints([0, innerHeight - 15], .3);

        yAxis = d3.svg.axis()
            .scale(catScale)
            .orient('left')
            .innerTickSize(-innerWidth);

        innerChart.append('g')
            .attr('class', 'y axis')
            .call(yAxis); 

        //fun
        colors = d3.scale.category20()
            .domain(categories);
        
        //Binding data to graph
        var gEvents = innerChart.selectAll('.event')
            .data(data)
          .enter().append('g')
            .attr('class', 'event')
            .on('mouseover', eventSelected)
            .on('mouseout', eventDeselected);

        // helper functions for main display loop
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

        // main display loop
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

    }
    chart.root = function() {
        return root;
    }

    chart.height = function(value) {
        console.log(this)
        if (!arguments.length) return height;
        height = value;
        return chart;
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    }

    //NEEDS thinking
    function eventSelected(d, i) {
        var element = this;
        updateDisplay(element.__data__);
        grayOut(element);
    }


    function eventDeselected(d, i) {
        var element = this;
        grayIn(element);
    }

    function updateDisplay(event) { // takes an event object and populates the display with it
        var refD = chart.root().select(".display");
        refD.select('.title')
            .text(event.title);
        refD.select('.body')
            .text("Lorem ipsum doloret sibi wub ipsum sed comericut");
        refD.select('.issuebox')
            .style('color', colors(event.issues[0]));
        refD.select('.author')
            .text('By nskelsey');

        var dateS = event.date.toDateString();
        dateS = dateS.substring(4);
        dateS = dateS.replace(/\s0/, ' ');
        dateS = dateS.substring(0,3) + '.' + dateS.substring(3);	

        refD.select('.date')
            .text(dateS);
    }

    function grayOut(elem){
        var g = d3.select(elem)
            .attr('class', "event focus");
        innerChart.selectAll('.event:not(.focus)')
            .transition()
            .style('opacity', .5);
    }

    function grayIn(elem) {
        var g = d3.select(elem)
            .attr('class', 'event');
        innerChart.selectAll('.event')
            .transition()
            .style('opacity', 1)
    }


    return chart;
}
