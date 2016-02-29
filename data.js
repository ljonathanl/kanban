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
        path: 'development.other.test',
        contents: []
      }
    },
    done: {
      path: 'development.done',
      contents: [{type: 'task', title: 'My super task', id: 'tsk4'}]
    }
  },
  qualification: {
      path: 'qualification',
      contents: [],
  },
  preproduction: {
      path: 'preproduction',
      contents: [],
  },
  production: {
      path: 'production',
      contents: [],
  },   
};

module.exports = exports = kanban;