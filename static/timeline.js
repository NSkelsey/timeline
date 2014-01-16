function timelineWidget() {
    // Constants
    var radius = 7.5,
    url = "/data",
    margin = {top: 10, left: 140, bottom: 15, right: 10},
    height = 200,
    width = 700;

    function chart(selection) {
        var display = selection.select(".display")
            .attr('class', 'display')
            .style('height', 200)
            .style('width', width);
        // does nothing for now
        var svg = selection.append("svg");

        var innerWidth = width - margin.left - margin.right;
        var innerHeight = height - margin.top - margin.bottom;
        var margin2 = {top: height + margin.top + margin.bottom, left: 140, bottom: 30, right: 10};
        var height2 = 50;

        svg.attr("width", width)
           .attr("height", height + margin.top + margin.bottom + height2 + margin2.bottom);
        
        categories = findCategories(data);		
        categories.reverse();
        categories.push("none");
        categories.reverse();
        console.log(categories);

        innerChart = svg.append('g')
            .attr('class', 'innerChart')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        var today = new Date(2014, 1, 4);
        var yesterday = new Date(2013, 10, 4);
        var dateInit = [yesterday, today];
        var minDate = d3.min(data, function(obj){ return obj.date });
        var maxDate = d3.max(data, function(obj){ return obj.date });

        //X axis
        tScale = d3.time.scale()
            .domain(dateInit)
            .range([margin.right, innerWidth - margin.right])

        xAxis = d3.svg.axis()
            .scale(tScale)
            .ticks(5)
            .orient("bottom");

        innerChart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + innerHeight + ')')
            .call(xAxis);
        
       //Second x Axis for context

         tScale2 = d3.time.scale()
            .domain([minDate, today])
            .range([margin.right, innerWidth - margin.right])

         xAxis2 = d3.svg.axis()
            .scale(tScale2)
            .ticks(8)
            .orient("bottom");

         context.append("g")
            .attr("class", 'x axis')
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

         brush = d3.svg.brush()
            .x(tScale2)
            .extent(dateInit)
            .on("brush", brushed);

         context.append("g")
            .attr("class", "x brush")
            .call(brush);

         context.selectAll('rect')
            .attr("height", height2);


        //Y axis
        catScale = d3.scale.ordinal()
            .domain(categories)
            .rangePoints([0, innerHeight - 15], .3);

        catScale2 = d3.scale.ordinal()
            .domain(categories)
            .rangePoints([20, height2 - 10]);

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
        
        // Zoom and pan
        function brushed() {
            tScale.domain(brush.empty() ? tScale2.domain() : brush.extent());
            innerChart.selectAll(".event").call(bubbleDraw);
            innerChart.select(".x.axis").call(xAxis);
        }

        //Binding data to graph
        var gEvents = innerChart.selectAll('.event')
            .data(data)
          .enter().append('g')
            .attr('class', 'event')
            .on('mouseover', eventSelected)
            .on('mouseout', eventDeselected);

        bubbleDraw(gEvents);

        // now we draw abunch of little black circles for context
        var contextG = context.selectAll('.event')
            .data(data)
          .enter().append('circle')
            .attr('class', 'event')
            .attr('r', 3)
            .attr('cx', function(d){ return tScale2(d.date) })
            .attr('cy', function(d){
                console.log(d);
                var possible = d.issues[0];
                return possible ? catScale2(possible) : catScale2("none");});


        
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
        // TODO find farthest

        //may need to become a function
        // main display loop
       function bubbleDraw(selection) {
        selection.selectAll("circle").remove();
        selection.selectAll("line").remove();
        // must be here because it must sit on top of circles
        d3.select(".innerChart").selectAll(".opaque").remove();
        d3.select(".innerChart")
          .append("rect")
            .attr("class", "opaque")
            .attr("opacity", ".5")
            .attr("width", margin.left)
            .attr("height", innerHeight)
            .attr("x", -margin.left);

        selection.each(function (event, i) {
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

    }

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
         //   topThree = topThree.slice(0,3);
            topThree = topThree.map(function(e) {return e[0];});
            return topThree;
        }


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
            var refD = display;
            refD.select('.title')
                .text(event.title);
            refD.select('.body')
                .text("Lorem ipsum doloret sibi wub ipsum sed comericut");
            var ibox = refD.select('.issueContainer').selectAll('div')
                .data(event.issues);

            var iEnter = ibox.enter().append("div")
                        .attr("class", "live")  

            ibox.style('background-color', function(d){ return colors(d)})
                .text(function(d){ return d })
                .style('border-color', function(d){ return colors(d)}); 

            var iExit = ibox.exit().remove();

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
    return chart;
}
