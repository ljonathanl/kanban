var dragTemp = {};

function getContentIndexById(id, contents) {
  var index = -1;
  for (var i = 0; i < contents.length; i++) {
    if (contents[i].id == id) {
      index = i;
      break;
    }
  }
  return index;
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


Vue.component('column', {
  template: '#container-template',
  props: {
    contents: Array,
    title: String
  },
  methods: {
    handleDragStart: function(event) {
      // console.log(event);
      // console.log(event.target.dataset.id);
      var index = getContentIndexById(event.target.dataset.id, this.contents);
      console.log(index);
      dragTemp.container = this.contents;
      dragTemp.draggedObject = this.contents[index];
    },
    handleDrop: function(event) {
      console.log(event);
      var lastContainer = dragTemp.container;
      var draggedObject = dragTemp.draggedObject;
      // console.dir(dragTemp.container);
      // console.dir(draggedObject);
      var index = getDropIndex(event, this);
      lastContainer.$remove(draggedObject);
      this.contents.splice(index, 0, draggedObject);
      dragTemp = {};
    }
  },
/*  ready: function() {
    var sortable = Sortable.create(this.$els.contents);
  }*/
})

Vue.component('line', {
  template: '#line-template',
  props: {
    title: String
  },
})

new Vue({
  el: 'body',
  data: {
    backlog: {
      evolution: [],
      bug: [
        {type: 'task', title: 'My super task', id: 'tsk1'},
        {type: 'task', title: 'My super task 2', id: 'tsk2'},
      ],
      technical: []
    },
    todo: [],
    development: {
      back: {
        ongoing: [{type: 'task', title: 'My super task', id: 'tsk3'}],
        test: []
      },
      front: {
        ongoing: [],
        test: []
      },
      cms: {
        ongoing: [],
        test: [{type: 'task', title: 'My super task', id: 'tsk5'}]
      },
      other: {
        ongoing: [],
        test: []
      },
      done: [{type: 'task', title: 'My super task', id: 'tsk4'}]
    },
    qualification: []
  }
})
