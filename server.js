var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});


app.use(express.static('public'));

io.on('connection', function (socket) {
  //socket.emit('news', { hello: 'world' });
  socket.on('action', function (data) {
    console.log(data);
  });
});

