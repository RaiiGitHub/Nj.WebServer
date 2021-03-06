const printf = require('printf');
module.exports = () =>printf( `
<head><script src="./js/plotly-latest.min.js"></script></head>
<div id="plotlyDiv"></div>
<script>
Plotly.d3.csv("./csv_exp1_wd.csv", function(err, rows){
  function unpack(rows, key) {
  return rows.map(function(row) { return row[key]; });
}

var trace1 = {
  type: "scatter",
  mode: "lines",
  name: 'AAPL High',
  x: unpack(rows, 'Date'),
  y: unpack(rows, 'AAPL.High'),
  line: {color: '#17BECF'}
}

var trace2 = {
  type: "scatter",
  mode: "lines",
  name: 'AAPL Low',
  x: unpack(rows, 'Date'),
  y: unpack(rows, 'AAPL.Low'),
  line: {color: '#7F7F7F'}
}

var data = [trace1,trace2];
    
var layout = {
  title: 'Basic Time Series', 
};

Plotly.newPlot('plotlyDiv', data, layout);
})
</script>
`);