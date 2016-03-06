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
    kanban.items.$remove(movedItem);
    kanban.items.push(movedItem);
    movedItem.x = action.to.x;
    movedItem.y = action.to.y; 
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

function getDropPosition(event, vm) {
  var x = Math.round(event.clientX / vm.$el.offsetWidth * 100);
  var y = Math.round(event.clientY / vm.$el.offsetHeight * 100);  
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
      dragTemp.item = event.target.dataset.id;
    },
    handleDrop: function(event) {
      console.log("handleDrop", event);
      var item = dragTemp.item;
      var position = getDropPosition(event, this);
      
      dragTemp = {};
      var action = {
        id: item,
        to: position  
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

// Vue.component('container', {
//   template: '#container-template',
//   props: {
//     name: String,
//     contents: Array
//   },
//   methods: {
//     handleDragStart: function(event) {
//       console.log("handleDragStart", event);
//       dragTemp.lastContainer = this.name;
//       dragTemp.item = event.target.dataset.id;
//       dragTemp.lastIndex = getContentIndexById(event.target.dataset.id, this.contents);
//     },
//     handleDrop: function(event) {
//       console.log("handleDrop", event);
//       var lastContainer = dragTemp.lastContainer;
//       var lastIndex = dragTemp.lastIndex;
//       var item = dragTemp.item;
//       var index = getDropIndex(event, this);
      
//       dragTemp = {};
//       var action = {
//         id: item,
//         from: {name: lastContainer, index: lastIndex}, 
//         to: {name: this.name, index: index}  
//       };

//       emit.move(action);
//       actions.move(action);
//     }
//   },
// })

new Vue({
  el: "body",
  data: kanban,
})

