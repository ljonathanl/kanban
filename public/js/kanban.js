var kanban = {
  backlog_evolution: 
  {
    contents: []
  }, 
  backlog_bug: 
  {
    contents: []
  },
  backlog_technical: 
  {
    contents: []
  },
  todo: 
  {
    contents: []
  },
  development_back_ongoing: 
  {
    contents: [],
  },
  development_back_test: 
  {
    contents: []
  },
  development_front_ongoing: 
  {
    contents: []
  },
  development_front_test: 
  {
    contents: []
  },
  development_cms_ongoing: 
  {
    contents: []
  },
  development_cms_test: 
  {
    contents: []
  },
  development_other_ongoing: 
  {
    contents: []
  },
  development_other_test: 
  {
    contents: []
  },
  development_done: {
    contents: []
  },
  qualification: {
    contents: []
  },
  preproduction: {
    contents: []
  },
  production: {
    contents: []
  }  
};

var items = {};

function findItems(kanban) {
  for (var k in kanban) {
    var container = kanban[k];
    var contents = container.contents;
    if (contents) {
      for (var i = 0; i < contents.length; i++) {
        var item = contents[i];
        items[item.id] = item;
      }
    }
  }
} 

var actions = {
  move: function(action) {
    var movedItem = items[action.id];
    var lastContainer = kanban[action.from.name].contents;
    var newContainer = kanban[action.to.name].contents;
    lastContainer.splice(action.from.index, 1);
    newContainer.splice(action.to.index, 0, movedItem);
  }
}

var emit = {
  move: function(action) {
    socket.emit('action', { type: 'move', action: action });
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
    id: String,
    title: String
  },
  computed: {
    model: function() {
      return kanban[this.id];
    }
  }
})

Vue.component('container', {
  template: '#container-template',
  props: {
    name: String,
    contents: Array
  },
  methods: {
    handleDragStart: function(event) {
      dragTemp.lastContainer = this.name;
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
        from: {name: lastContainer, index: lastIndex}, 
        to: {name: this.name, index: index}  
      };

      emit.move(action);
      actions.move(action);
    }
  },
})

var Backlog = Vue.component('backlog', {
  template: '#backlog-template',
})

var Development = Vue.component('development', {
  template: '#development-template',
})

var Release = Vue.component('release', {
  template: '#release-template',
})

var App = Vue.extend({
  data: function() {
    return kanban;
  }  
});

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

