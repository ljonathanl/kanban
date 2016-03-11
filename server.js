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
  socket.on('action', function (actionData) {
  	console.log("action: ", actionData.type);
  	if (actionData.action.id == "new") {
  		var id = Math.floor(new Date().getTime() / 1000);
  		actionData.action.id = id;
  		var newTask = {title: "New task", id: id};
  		data.items[id] = newTask;
  		socket.broadcast.emit('create', newTask);
  		io.sockets.emit('create', newTask);
  		socket.emit('show', id);
  	}
  	actions[actionData.type](actionData.action);
    io.sockets.emit('action', actionData);
  });
});

