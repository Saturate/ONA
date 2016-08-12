// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')();
var port = process.env.PORT || 3560;
var path = require('path');

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
console.log(path.resolve(__dirname, '../public'));
app.use(express.static(path.resolve(__dirname, '../public')));
