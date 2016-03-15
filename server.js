var config = require('./config');
var data = require('./data');
var actions = require('./actions');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');

server.listen(config.port, config.host);
app.use(bodyParser.json());

io.on('connection', function (socket) {
  socket.emit('data', data.kanban);
  socket.on('action', function (actionData) {
    console.log("action: ", actionData.type);
    if (actionData.action.id == "new") {
      var id = "tsk-" + Math.floor(new Date().getTime() / 1000);
      actionData.action.id = id;
      var newTask = {title: "New task", id: id, x: 0, y: 0, category: "other"};
      data.items[id] = newTask;
      io.sockets.emit('action', {type: 'create', action: newTask});
      socket.emit('show', id);
    }
    actions[actionData.type](actionData.action);
    io.sockets.emit('action', actionData);
    data.save();
  });
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/kanban.json', function (req, res) {
  res.json(data.kanban);  
});

app.post('/kanban.json', function (req, res) {
  var kanban = req.body;
  data.load(kanban);
  io.sockets.emit('data', data.kanban);
  res.sendStatus(200);
});

app.use(express.static('public'));



