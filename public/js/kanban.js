var kanban = {
  items: [],
  archive: [],
  currentTask: null,
  ready: false,
  categories: ["back", "front", "cms", "db", "impediment", "bug", "release", "other"]  
};

var items = {};

function findItems(tasks) {
  for (var i = 0; i < tasks.length; i++) {
    var item = tasks[i];
    items[item.id] = item;
    while(item.task) {
      item = item.task;
      items[item.id] = item;
    }
  }
} 

var zones = [];

function clone(object) {
  return JSON.parse(JSON.stringify(object));
}

function addZone(id, rectangle) {
  zones.push({id: id, rectangle: rectangle});
}

function getZones(position) {
  var result = [];
  for (var i = 0; i < zones.length; i++) {
    var zone = zones[i];
    if (position.x >= zone.rectangle.left 
      && position.x <= zone.rectangle.right
      && position.y >= zone.rectangle.top
      && position.y <= zone.rectangle.bottom) {
      result.push(zone.id);
    }
  }
  if (result.length == 0) {
    result.push('kanban');
  }
  return result;
}

var actions = {
  move: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    if (action.from == 'kanban') {
      kanban.items.$remove(movedItem);
    } else if (items[action.from]) {
      items[action.from].task = null;
    }
    kanban.items.push(movedItem);
    movedItem.x = action.to.x;
    movedItem.y = action.to.y; 
    Vue.set(movedItem, 'parent', null);
  },
  add: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    var container = items[action.to];
    if (action.from == 'kanban') {
      kanban.items.$remove(movedItem);
    } else if (items[action.from]) {
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
    Vue.set(movedItem, 'parent', container.id);
  },
  update: function(action) {
    console.log(action);
    var updatedItem = items[action.id];
    for (var k in action.properties) {
      Vue.set(updatedItem, k, action.properties[k]);   
    }
  },
  create: function(action) {
    Vue.set(items, action.id, action);
  },
  archive: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    if (action.from == 'kanban') {
      kanban.items.$remove(movedItem);
    } else if (items[action.from]) {
      items[action.from].task = null;
    }
    Vue.set(movedItem, 'parent', null);
    kanban.archive.push(movedItem);
  },
  remove: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    if (action.from == 'kanban') {
      kanban.items.$remove(movedItem);
    } else if (items[action.from]) {
      items[action.from].task = null;
    }
    var subTask = movedItem;
    while (subTask) {
      delete items[subTask.id];
      subTask = subTask.task;
    }
  },
}

var emit = {
  move: function(action) {
    socket.emit('action', { type: 'move', action: action });
  },
  add: function(action) {
    socket.emit('action', { type: 'add', action: action });
  },
  update: function(action) {
    socket.emit('action', { type: 'update', action: action });
  },
  remove: function(action) {
    socket.emit('action', { type: 'remove', action: action });
  },
  archive: function(action) {
    socket.emit('action', { type: 'archive', action: action });
  },
}

var waiting = [];

var socket = io.connect('http://localhost:8080');
socket.on('action', function (data) {
  actions[data.type](data.action);
});
socket.on('show', function (data) {
  showTask(data);
});
socket.on('data', function (data) {
  for (var k in kanban) {
    if (k in data) {
      kanban[k] = data[k];
    }
  }
  findItems(kanban.items);
  findItems(kanban.archive);
  kanban.ready = true;
  for (var i = 0; i < waiting.length; i++) {
    waiting[i]();
  }
});

var dragTemp = null;


function getDropPosition(event, container, offsetX, offsetY) {
  var x = event.clientX - offsetX + window.scrollX;
  var y = event.clientY - offsetY  + window.scrollY;  
  return {x: x, y: y};
}

function showTask(id) {
  if (!kanban.ready) {
    var showTaskDiffered = function() {
      showTask(id);
    }
    waiting.push(showTaskDiffered);
    return;
  }
  var task = items[id];
  if (!task) {
    history.pushState("", document.title, window.location.pathname);
    kanban.currentTask = null;
  } else {
    kanban.currentTask = clone(task);
    window.location.hash = id;
  }
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
      // for firefox
      event.dataTransfer.setData('id', event.target.dataset.id);
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
      
      // console.log("zones", getZones(position));
      dragTemp = null;
      var action = {
        id: item,
        to: position,
        from: lastContainer   
      };

      this.selected = false;
      emit.move(action);
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
    dragged: Boolean,
  },
  computed: {
    background: function() {
      return this.model.category + (this.selected ? " selected" : "") + (this.dragged ? " dragged" : ""); 
    },
  },
  methods: {
    handleDragStart: function(event) {
      console.log("handleDragStart", event);
      // for firefox
      event.dataTransfer.setData('id', event.target.dataset.id);
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
    },
    handleDragOver: function(event) {
      var task = items[dragTemp.item];
      while (task) {
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
    },
    edit: function() {
      showTask(this.model.id);
    }
  }
})

Vue.component('zone', {
  template: '#zone-template',
  props: {
    title: String
  },
  attached: function() {
    addZone(this.title, this.$el.getBoundingClientRect());
  }  
})

Vue.component('menu', {
  template: '#menu-template',
  methods: {
    handleDrag: function(event) {
      console.log("handleDragStart", event);
      // for firefox
      event.dataTransfer.setData('id', 'new');
      dragTemp = {};
      dragTemp.item = "new";
      dragTemp.from = "menu";
      dragTemp.x = event.offsetX;
      dragTemp.y = event.offsetY;
      console.log(dragTemp);
    },
  }
})

Vue.component('trash', {
  template: '#trash-template',
  props: {
    selected: Boolean
  },
  methods: {
    handleDrop: function(event) {
      console.log("handleDrop", event);
      var item = dragTemp.item;
      var lastContainer = dragTemp.from;
      
      dragTemp = null;
      var action = {
        id: item,
        from: lastContainer   
      };

      this.selected = false;
      emit.remove(action);
    },
    handleDragOver: function(event) {
      this.selected = true;
    },
    handleDragLeave: function(event) {
      this.selected = false;
    }
  },
})

Vue.component('archive', {
  template: '#archive-template',
  props: {
    selected: Boolean
  },
  methods: {
    handleDrop: function(event) {
      console.log("handleDrop", event);
      var item = dragTemp.item;
      var lastContainer = dragTemp.from;
      
      dragTemp = null;
      var action = {
        id: item,
        from: lastContainer   
      };

      this.selected = false;
      emit.archive(action);
    },
    handleDragOver: function(event) {
      this.selected = true;
    },
    handleDragLeave: function(event) {
      this.selected = false;
    }
  },
})

Vue.component('edit-task', {
  template: '#edit-task-template',
  props: {
    task: null,
    categories: Array,
  }, 
  methods: {
    edit: function() {
      var originalTask = items[this.task.id];
      var properties = {};
      var hasChanged = false;
      for (var k in originalTask) {
        if (originalTask[k] != this.task[k]) {
          properties[k] = this.task[k];
          hasChanged = true;
        }
      }
      if (hasChanged) {
        var action = {
          id: this.task.id,
          properties: properties  
        }
        emit.update(action);
      }
      showTask(null);
    },
    cancel: function() {
      showTask(null);
    }
  }
})

new Vue({
  el: "body",
  data: kanban,
})

window.addEventListener('hashchange', function() {
    var path = window.location.hash;
    showTask(path.substring(1));
});

var path = window.location.hash;
showTask(path.substring(1));

