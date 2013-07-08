var express = require('express');

var app = express.createServer(express.logger());

var fs = require('fs');
var index = fs.readFileSync('index.html');


app.get('/', function(request, response) {
  response.send('Hello World 2!');
});

app.get('/index.html', function(request, response) {
  response.send(index.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});