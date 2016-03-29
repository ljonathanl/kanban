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
    console.log("action: ", new Date().getTime());
    console.log(actionData);
    if (actionData.action.from && actionData.action.from == "menu") {
      var show = false;
      if (actionData.action.id == "new") {
        actionData.action.id = "tsk-" + Math.floor(new Date().getTime() / 1000);
        show = true;
      }
      var newTask = {title: "New task", id: actionData.action.id, x: 0, y: 0, category: "other"};
      data.items[actionData.action.id] = newTask;
      io.sockets.emit('action', {type: 'create', action: newTask});
      if (show) {
        socket.emit('show', actionData.action.id);
      }
    }
    if (!data.items[actionData.action.id]) {
      socket.emit('alert', "The task does not exist");
      return;
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
  console.log("load: ", new Date().getTime());
  res.json(data.kanban);  
});

app.post('/kanban.json', function (req, res) {
  console.log("save: ", new Date().getTime());
  var kanban = req.body;
  data.load(kanban);
  io.sockets.emit('data', data.kanban);
  res.sendStatus(200);
});

app.use(express.static('public'));



