var kanban = {
  items: [],
  archive: [],
  currentTask: null,
  ready: false,
  categories: ["admin", "developer", "partner", "db", "impediment", "bug", "release", "other"],
  stickers: ["blue", "red", "yellow", "purple", "green", "brown", "pink", "orange", "black"],
  currentSticker: null
};

var editableProperties = {'title': true, 'category': true, 'notes': true, 'sticker': true};

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

function getZones(id) {
  var task = items[id];
  while(task.parent) {
    task = items[task.parent];
  }
  var result = [];
  for (var i = 0; i < zones.length; i++) {
    var zone = zones[i];
    if (task.x >= zone.rectangle.left 
      && task.x <= zone.rectangle.right
      && task.y >= zone.rectangle.top
      && task.y <= zone.rectangle.bottom) {
      result.push(zone.id);
    }
  }
  if (result.length == 0) {
    result.push('kanban');
  }
  return result;
}

function removeFrom(item, fromId) {
  if (fromId == 'kanban') {
    kanban.items.$remove(item);
  } else if (items[fromId]) {
    items[fromId].task = null;
  }
}

var actions = {
  move: function(action) {
    var movedItem = items[action.id];
    removeFrom(movedItem, action.from);
    kanban.items.push(movedItem);
    movedItem.x = action.to.x;
    movedItem.y = action.to.y; 
    Vue.set(movedItem, 'parent', null);
  },
  add: function(action) {
    var movedItem = items[action.id];
    var container = items[action.to];
    removeFrom(movedItem, action.from);
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
    var updatedItem = items[action.id];
    for (var k in action.properties) {
      Vue.set(updatedItem, k, action.properties[k]);   
    }
  },
  create: function(action) {
    Vue.set(items, action.id, action);
  },
  archive: function(action) {
    var movedItem = items[action.id];
    removeFrom(movedItem, action.from);
    Vue.set(movedItem, 'parent', null);
    kanban.archive.push(movedItem);
  },
  remove: function(action) {
    var movedItem = items[action.id];
    removeFrom(movedItem, action.from);
    var subTask = movedItem;
    while (subTask) {
      delete items[subTask.id];
      subTask = subTask.task;
    }
  },
}

function emit(type, action) {
  socket.emit('action', { type: type, action: action });
}

var waiting = [];

var socket = createSocket('/');

socket.on('action', function (data) {
  actions[data.type](data.action);
});
socket.on('show', function (data) {
  showTask(data);
});
socket.on('data', function (data) {
  console.log('data', data);
  items = {};
  kanban.items = data.items;
  kanban.archive = data.archive;
  findItems(kanban.items);
  findItems(kanban.archive);
  kanban.ready = true;
  for (var i = 0; i < waiting.length; i++) {
    waiting[i]();
  }
  waiting = [];
});

var dragTemp = null;


function getDropPosition(event, offsetX, offsetY) {
  var node = event.target;
  var nodeOffsetX = 0; 
  var nodeOffsetY = 0;
  while (node != document) {
    nodeOffsetX += node.clientLeft;
    nodeOffsetY += node.clientTop;
    node = node.parentNode;
  }
  var x = event.clientX - (offsetX + nodeOffsetX) + window.scrollX;
  var y = event.clientY - (offsetY + nodeOffsetY) + window.scrollY;  
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

Vue.component('kanban', {
  template: '#kanban-template',
  data: function() {
    return kanban;
  },
  methods: {
    dragStart: function(event) {
      if (dragTemp) return;
      dragTemp = {};
      dragTemp.item = event.target.dataset.id;
      dragTemp.from = "kanban";
      dragTemp.x = event.offsetX;
      dragTemp.y = event.offsetY;
    },
    drop: function(event) {
      var item = dragTemp.item;
      var offsetX = dragTemp.x;
      var offsetY = dragTemp.y;
      if (dragTemp.from != 'kanban') {
        offsetX = offsetY = 0;
      }
      var position = getDropPosition(event, dragTemp.x, dragTemp.y);
      var lastContainer = dragTemp.from;
      dragTemp = null;
      var action = {
        id: item,
        to: position,
        from: lastContainer   
      };
      emit('move', action);
    },
  },
})

Vue.component('task', {
  template: '#task-template',
  props: {
    model: Object,
  },
  computed: {
    background: function() {
      return this.model.category + (kanban.currentSticker && kanban.currentSticker != this.model.sticker ? " fade" : ""); 
    },
  },
  methods: {
    dragStart: function(event) {
      event.stopPropagation();
      dragTemp = {};
      dragTemp.item = this.model.task.id;
      dragTemp.from = this.model.id;
      dragTemp.x = event.offsetX;
      dragTemp.y = event.offsetY;
    },
    drop: function(event) {
      var item = dragTemp.item;
      var lastContainer = dragTemp.from;
      
      dragTemp = null;
      var action = {
        id: item,
        to: this.model.id,
        from: lastContainer  
      }
      emit('add', action);
    },
    acceptDrop: function(event) {
      var task = items[dragTemp.item];
      while (task) {
        if (task.id == this.model.id) return false;
        task = task.task;
      }
      return true;
    },
    edit: function() {
      showTask(this.model.id);
    },
    toggleSticker: function() {
      if (kanban.currentSticker == this.model.sticker) {
        kanban.currentSticker = null;
      } else {
        kanban.currentSticker = this.model.sticker;
      }
    }
  }
})

Vue.component('zone', {
  template: '#zone-template',
  props: {
    title: String
  },
  attached: function() {
    var el = this.$el;
    addZone(this.title, {top: el.offsetTop, bottom: el.offsetTop + el.offsetHeight, left: el.offsetLeft, right: el.offsetLeft + el.offsetWidth});
  }  
})

Vue.component('menu', {
  template: '#menu-template',
  methods: {
    dragStart: function(event) {
      // for firefox
      dragTemp = {};
      dragTemp.item = "new";
      dragTemp.from = "menu";
      dragTemp.x = event.offsetX;
      dragTemp.y = event.offsetY;
    },
  }
})

Vue.component('trash', {
  template: '#trash-template',
  methods: {
    drop: function(event) {
      var item = dragTemp.item;
      var lastContainer = dragTemp.from;
      
      dragTemp = null;
      var action = {
        id: item,
        from: lastContainer   
      };

      emit('remove', action);
    },
  },
})

Vue.component('archive', {
  template: '#archive-template',
  methods: {
    drop: function(event) {
      var item = dragTemp.item;
      var lastContainer = dragTemp.from;
      
      dragTemp = null;
      var action = {
        id: item,
        from: lastContainer   
      };
      emit('archive', action);
    },
  },
})

var editor;

Vue.component('edit-task', {
  template: '#edit-task-template',
  props: {
    task: null,
    categories: Array,
    editingNotes: Boolean,
    stickers: Array
  }, 
  methods: {
    edit: function() {
      var originalTask = items[this.task.id];
      var properties = {};
      var hasChanged = false;
      if (this.task.sticker == "none") {
        this.task.sticker = null;
      }
      this.finishEditNotes();
      for (var k in editableProperties) {
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
        emit('update', action);
      }
      this.close();
    },
    close: function() {
      this.editingNotes = false;
      editor = null;
      showTask(null);
    },
    startEditNotes: function() {
      this.editingNotes = true;
      Vue.nextTick(function () {
        editor = CKEDITOR.replace('notes-editor');
        editor.config.height = 300;
      });
    },
    finishEditNotes: function() {
      if (editor) {
        Vue.set(this.task, "notes", editor.getData());
        editor = null;
        this.editingNotes = false;
      }
    },
    endEditTitle: function() {
      this.task.title = this.$els.title.innerText;
    },
  },
  computed: {
    zones: function () {
      if (!this.task) return "";
      return getZones(this.task.id).join(", ");
    }
  },
  attached: function() {
    this.$watch('task', function (val) {
      if (val && val.title == "New task") {
        this.$els.title.focus();
        document.execCommand('selectAll', false, null);
      }
    })
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

