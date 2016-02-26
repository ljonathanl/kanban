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
    handleDrop: function(a,b) {
      console.log(a,b);
    }
  }
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
