var data = {kanban:{}};

var items = {};

function findItems(kanban) {
  for (var k in kanban) {
    if (k == 'contents') {
      var contents = kanban[k];
      for (var i = 0; i < contents.length; i++) {
        var item = contents[i];
        items[item.id] = item;
      }
    } else if (typeof kanban[k] === 'object') {
      findItems(kanban[k]);
    }
  }
} 

function getContents(path) {
  var paths = path.split(".");
  var item = kanban;
  for (var i = 0; i < paths.length; i++) {
    item = item[paths[i]];
  }
  return item.contents;
}

var actions = {
  move: function(action) {
    var movedItem = items[action.id];
    var lastContainer = getContents(action.from.path);
    var newContainer = getContents(action.to.path);
    lastContainer.$remove(movedItem);
    newContainer.splice(action.to.index, 0, movedItem);
  }
}

var emit = {
  move: function(action) {
    socket.emit('action', { type: 'move', action: action });
  }
}

var dones = [];

function activate(done) {
  if (data.kanban) {
    done();
  } else {
    dones.push(done);
  }
}

var socket = io.connect('http://localhost:8080');
socket.on('action', function (data) {
  console.log(data);
  //socket.emit('my other event', { my: 'data' });
  actions[data.type](data.action);
});
socket.on('data', function (kanban) {
  data.kanban = kanban;
  findItems(kanban);
  for (var i = 0; i < dones.length; i++) {
     dones[i]();
  }
  dones = [];
});

var dragTemp = {};

function getContentIndexById(id, contents) {
  for (var i = 0; i < contents.length; i++) {
    if (contents[i].id == id) return i;
  }
  return -1;
}

function getDropIndex(event, vm) {
  var element = event.target
  while (element != vm.$els.contents) {
    if (element.dataset.id != undefined) {
      return getContentIndexById(element.dataset.id, vm.contents);
    }
    element = element.parentNode;
  }
  return vm.contents.length;
}

Vue.config.debug = true;

Vue.component('kanban', {
  template: '#kanban-template'
})

Vue.component('task', {
  template: '#task-template',
  props: {
    model: Object
  },
  methods: {
    handleDoubleClick: function(event) {
      console.log("double click");
    }
  }
})

Vue.component('line', {
  template: '#line-template',
  props: {
    title: String
  },
})

Vue.component('column', {
  template: '#column-template',
  props: {
    title: String,
    model: Object,
  },
})

Vue.component('container', {
  template: '#container-template',
  props: {
    path: String,
    contents: Array
  },
  methods: {
    handleDragStart: function(event) {
      dragTemp.lastContainer = this.path;
      dragTemp.item = event.target.dataset.id;
      dragTemp.lastIndex = getContentIndexById(event.target.dataset.id, this.contents);
    },
    handleDrop: function(event) {
      var lastContainer = dragTemp.lastContainer;
      var lastIndex = dragTemp.lastIndex;
      var item = dragTemp.item;
      var index = getDropIndex(event, this);
      
      dragTemp = {};
      var action = {
        id: item,
        from: {path: lastContainer, index: lastIndex}, 
        to: {path: this.path, index: index}  
      };

      emit.move(action);
      actions.move(action);
    }
  },
})

var Backlog = Vue.component('backlog', {
  template: '#backlog-template',
  activate: activate,
  data: function() {
    return data;
  }
})

var Development = Vue.component('development', {
  template: '#development-template',
  activate: activate,
  data: function() {
    return data;
  }
})

var Release = Vue.component('release', {
  template: '#release-template',
  activate: activate,
  data: function() {
    return data;
  }
})

var App = Vue.extend({});

var router = new VueRouter();

router.map({
    '/': {
        component: Development
    },
    '/backlog': {
        component: Backlog
    },
    '/development': {
        component: Development
    },
    '/release': {
        component: Release
    },
});

router.start(App, '#app');

