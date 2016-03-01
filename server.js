var data = require('./data');
var actions = require('./actions');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});


app.use(express.static('public'));

io.on('connection', function (socket) {
  socket.emit('data', data.kanban);
  socket.on('action', function (data) {
  	actions[data.type](data.action);
    socket.broadcast.emit('action', data);
  });
});

