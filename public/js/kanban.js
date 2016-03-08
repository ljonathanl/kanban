var kanban = {
  items: []  
};

var items = {};

function findItems(kanban) {
  for (var i = 0; i < kanban.items.length; i++) {
    var item = kanban.items[i];
    items[item.id] = item;
  }
} 

var actions = {
  move: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    if (action.from == 'kanban') {
      kanban.items.$remove(movedItem);
    } else {
      items[action.from].task = null;
    }
    kanban.items.push(movedItem);
    movedItem.x = action.to.x;
    movedItem.y = action.to.y; 
  },
  add: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    var container = items[action.to];
    if (action.from == 'kanban') {
      kanban.items.$remove(movedItem);
    } else {
      items[action.from].task = null;
    }
    if (container.task) {
      var lastTask = movedItem;
      while (lastTask.task) {
        lastTask = lastTask.task;
      }
      Vue.set(lastTask, 'task', container.task);
    }
    Vue.set(container, 'task', movedItem); 
  },
}

var emit = {
  move: function(action) {
    socket.emit('action', { type: 'move', action: action });
  },
  add: function(action) {
    socket.emit('action', { type: 'add', action: action });
  }
}

var socket = io.connect('http://localhost:8080');
socket.on('action', function (data) {
  actions[data.type](data.action);
});
socket.on('data', function (data) {
  for (var k in kanban) {
    if (k in data) {
      kanban[k] = data[k];
    }
  }
  findItems(kanban);
});

var dragTemp = null;

function getContentIndexById(id, contents) {
  for (var i = 0; i < contents.length; i++) {
    if (contents[i].id == id) return i;
  }
  return -1;
}


function getDropPosition(event, container, offsetX, offsetY) {
  var x = Math.round((event.clientX + offsetX) / container.offsetWidth * 100);
  var y = Math.round((event.clientY + offsetY) / container.offsetHeight * 100);  
  return {x: x, y: y};
}

Vue.config.debug = true;

Vue.component('kanban', {
  template: '#kanban-template',
  data: function() {
    return kanban;
  },
  methods: {
    handleDragStart: function(event) {
      console.log("handleDragStart", event);
      if (!dragTemp) {
        dragTemp = {};
        dragTemp.item = event.target.dataset.id;
        dragTemp.from = "kanban";
        var style = window.getComputedStyle(event.target, null);
        dragTemp.x = parseInt(style.getPropertyValue("left"),10) - event.clientX;
        dragTemp.y = parseInt(style.getPropertyValue("top"),10) - event.clientY;
      }
    },
    handleDrop: function(event) {
      console.log("handleDrop", event);
      var item = dragTemp.item;
      var position = getDropPosition(event, this.$els.contents, dragTemp.x, dragTemp.y);
      var lastContainer = dragTemp.from;
      
      dragTemp = null;
      var action = {
        id: item,
        to: position,
        from: lastContainer   
      };

      emit.move(action);
      actions.move(action);
    }
  },
})

Vue.component('task', {
  template: '#task-template',
  props: {
    model: Object
  },
  methods: {
    handleDoubleClick: function(event) {
      console.log("double click");
    },
    handleDragStart: function(event) {
      console.log("handleDragStart", event);
      dragTemp = {};
      dragTemp.item = this.model.task.id;
      dragTemp.from = this.model.id;
      var style = window.getComputedStyle(event.target, null);
      dragTemp.x = parseInt(style.getPropertyValue("left"),10) - event.clientX;
      dragTemp.y = parseInt(style.getPropertyValue("top"),10) - event.clientY;
    },
    handleDrop: function(event) {
      console.log("handleDrop", event);
      var item = dragTemp.item;
      var lastContainer = dragTemp.from;
      
      dragTemp = null;
      var action = {
        id: item,
        to: this.model.id,
        from: lastContainer  
      };

      emit.add(action);
      actions.add(action);
    }
  }
})

new Vue({
  el: "body",
  data: kanban,
})

