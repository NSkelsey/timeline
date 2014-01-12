function dealWithSheet(json) {
    console.log(json);
    table = json.table;        
    col_titles = [];
    // NOTE this switches occasionally
    for (var i = 0; i < table.rows[0].c.length; i++){
        col_titles.push(table.cols[i].label);
    }
    var start = 0;
    if (col_titles.length < 1) {
        table.rows[0].c.forEach(function(col){
            col_title.push(col.v);
        });
        start = 1;
    }
    // Done with error handle

    var yFormat = d3.time.format("%Y");
    var mFormat = d3.time.format("%Y-%m");
    var dFormat = d3.time.format("%m/%d/%Y");
    var events = []
    rows = table.rows;
    for (var i = start; i < table.rows.length; i++){
        var event = {};
        for (var j = 0; j < col_titles.length; j++){
            var col = col_titles[j],
            val = rows[i].c[j].v; 

            if (col === "issues") {
                // trim whitespace and filter blank entries
                val = val.split(',').map(function(s){ return s.trim()});
                val = val.filter(function(s) { return s || false });
            }
            if (col === "date") {
                var raw = val; 
                val = mFormat.parse(raw);
                val = val ? val : dFormat.parse(raw);
                val = val ? val : yFormat.parse(raw);
                // adds event to today if bad formating
                val = val ? val : new Date();

            }
            event[col] = val;
        }
        events.push(event);
    } 
    return events;
}

