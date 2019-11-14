const printf = require('printf');
const md = require('markdown-it')()
const vis = require('markvis')
const d3 = require('d3')  // in browser environment
const d3node = require('d3-node') // in node environment
const content = require('./content')
const http = require('http');
const csvplot = require('./csv_plot_content');
const websvr = require('./WebSvr.js');

console.log(printf('hello,world!%s', 'Node.js'));

const mvplot = md.use(vis).render(content(), { d3, d3node })
svr = new websvr()
svr.start(function (req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(mvplot+csvplot());
  res.end();
});

