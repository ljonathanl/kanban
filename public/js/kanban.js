var kanban = {
  backlog: {
    evolution: {
      path: 'backlog.evolution',
      contents: [],
    }, 
    bug: {
      path: 'backlog.bug',
      contents: [
        {type: 'task', title: 'My super task', id: 'tsk1'},
        {type: 'task', title: 'My super task 2', id: 'tsk2'},
      ],
    },
    technical: {
      path: 'backlog.technical',
      contents: []
    }
  },
  todo: {
      path: 'todo',
      contents: [],
  },
  development: {
    back: {
      ongoing: {
        path: 'development.back.ongoing',
        contents: [{type: 'task', title: 'My super task', id: 'tsk3'}],
      },
      test: {
        path: 'development.back.test',
        contents: []
      }
    },
    front: {
      ongoing: {
        path: 'development.front.ongoing',
        contents: [],
      },
      test: {
        path: 'development.front.test',
        contents: []
      }
    },
    cms: {
      ongoing: {
        path: 'development.cms.ongoing',
        contents: [],
      },
      test: {
        path: 'development.cms.test',
        contents: [{type: 'task', title: 'My super task', id: 'tsk5'}]
      }
    },
    other: {
      ongoing: {
        path: 'development.other.ongoing',
        contents: [],
      },
      test: {
        path: 'development.other.ongoing',
        contents: []
      }
    },
    done: {
      path: 'done',
      contents: [{type: 'task', title: 'My super task', id: 'tsk4'}]
    }
  }
};

var items = {};

function findItems(kanban) {
  for (var k in kanban) {
    console.log(k);
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

findItems(kanban);

var actions = {
  move: function(action) {
    var movedItem = items[id];
    var lastContainer = kanban[action.from.path].contents;
    var newContainer = kanban[action.to.path].contents;
    lastContainer.$remove(moved);
    newContainer.splice(action.to.index, 0, movedItem);
  }
}

var emit = {
  move: function(action) {
    socket.emit('action', { type: 'move', action: action });
  }
}

var socket = io.connect('http://localhost');
socket.on('action', function (data) {
  //console.log(data);
  //socket.emit('my other event', { my: 'data' });
  actions[data.type](data.action);
});

var dragTemp = {};

function getContentIndexById(id, contents) {
  for (var i = 0; i < contents.length; i++) {
    if (contents[i].id == id) return i;
  }
  return -1;
}

function getDropIndex(event, vm) {
  console.log(event.target);
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
    },
    handleDrop: function(event) {
      console.log(event);
      var lastContainer = dragTemp.lastContainer;
      var item = dragTemp.item;
      var index = getDropIndex(event, this);
      
      dragTemp = {};
      emit.move(
        {
          id: item,
          from: lastContainer, 
          to: {path: this.path, index: index}  
        });
    }
  },
})

new Vue({
  el: 'body',
  data: kanban
})




