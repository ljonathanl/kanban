var kanban = {
  backlog_evolution: 
  {
    contents: []
  }, 
  backlog_bug: 
  {
    contents: [{type: 'task', title: 'My super task', id: 'tsk1'}, {type: 'task', title: 'My super task 2', id: 'tsk2'}]
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
    contents: [{type: 'task', title: 'My super task', id: 'tsk3'}],
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
    contents: [{type: 'task', title: 'My super task', id: 'tsk5'}]
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
    contents: [{type: 'task', title: 'My super task', id: 'tsk4'}]
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

module.exports = exports = kanban;