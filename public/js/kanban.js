var kanban = {
  items: []  
};

var items = {};

function findItems(kanban) {
  for (var i = 0; i < kanban.items.length; i++) {
    var item = kanban.items[i];
    items[item.id] = item;
    while(item.task) {
      item = item.task;
      items[item.id] = item;
    }
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

function getDropPosition(event, container, offsetX, offsetY) {
  var x = event.clientX - offsetX;
  var y = event.clientY - offsetY;  
  return {x: x, y: y};
}

Vue.config.debug = true;

Vue.component('kanban', {
  template: '#kanban-template',
  data: function() {
    return kanban;
  },
  props: {
    selected: Boolean
  },
  methods: {
    handleDragStart: function(event) {
      console.log("handleDragStart", event);
      if (dragTemp) return;
      dragTemp = {};
      dragTemp.item = event.target.dataset.id;
      dragTemp.from = "kanban";
      dragTemp.x = event.offsetX;
      dragTemp.y = event.offsetY;
      console.log(dragTemp);
    },
    handleDrop: function(event) {
      console.log("handleDrop", event);
      var item = dragTemp.item;
      var offsetX = dragTemp.x;
      var offsetY = dragTemp.y;
      if (dragTemp.from != 'kanban') {
        offsetX = offsetY = 0;
      }
      var position = getDropPosition(event, this.$els.contents, dragTemp.x, dragTemp.y);
      var lastContainer = dragTemp.from;
      
      dragTemp = null;
      var action = {
        id: item,
        to: position,
        from: lastContainer   
      };

      this.selected = false;
      emit.move(action);
      actions.move(action);
    },
    handleDragOver: function(event) {
      this.selected = true;
    },
    handleDragLeave: function(event) {
      this.selected = false;
    }
  },
})

Vue.component('task', {
  template: '#task-template',
  props: {
    model: Object,
    selected: Boolean,
    dragged: Boolean
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
      dragTemp.x = event.offsetX;
      dragTemp.y = event.offsetY;
      console.log(dragTemp);
    },
    handleDrop: function(event) {
      var task = items[dragTemp.item];
      while (task) {
        if (task.id == this.model.id) return false;
        task = task.task;
      }
      console.log("handleDrop", event);
      event.stopPropagation();
      var item = dragTemp.item;
      var lastContainer = dragTemp.from;
      
      dragTemp = null;
      var action = {
        id: item,
        to: this.model.id,
        from: lastContainer  
      }

      this.selected = false;
      emit.add(action);
      actions.add(action);
    },
    handleDragOver: function(event) {
      var task = items[dragTemp.item];
      while (task) {
        console.log("subtask: ", task.id)
        if (task.id == this.model.id) return false;
        task = task.task;
      }
      event.stopPropagation();
      this.selected = true;
    },
    handleDragLeave: function(event) {
      this.selected = false;
    },
    handleDrag: function(event) {
      console.log("handleDrag", event);
      this.dragged = true;
    },
    handleDragEnd: function(event) {
      console.log("handleDragEnd", event);
      this.dragged = false;
    }
  }
})

Vue.component('zone', {
  template: '#zone-template',
  props: {
    title: String
  }  
})

new Vue({
  el: "body",
  data: kanban,
})

