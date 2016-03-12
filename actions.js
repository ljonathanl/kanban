var data = require('./data');
var kanban = data.kanban;
var items = data.items;

function remove(items, item) {
	var index = items.indexOf(item)
	if (index !== -1) {
	  items.splice(index, 1)
	}
}

var actions = {
  move: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    if (action.from == 'kanban') {
      remove(kanban.items, movedItem);
    } else if (items[action.from]) {
      items[action.from].task = null;
    }
    kanban.items.push(movedItem);
    movedItem.x = action.to.x;
    movedItem.y = action.to.y; 
    movedItem.parent = null;
  },
  add: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    var container = items[action.to];
    if (action.from == 'kanban') {
      remove(kanban.items, movedItem);
    } else if (items[action.from]) {
      items[action.from].task = null;
    }
    if (container.task) {
      var lastTask = movedItem;
      while (lastTask.task) {
        lastTask = lastTask.task;
      }
      lastTask.task = container.task;
    }
    container.task = movedItem;
    movedItem.parent = container.id;
  },
  update: function(action) {
    console.log(action);
    var updatedItem = items[action.id];
    updatedItem[action.property] = action.value;   
  },
  archive: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    if (action.from == 'kanban') {
      remove(kanban.items, movedItem);
    } else if (items[action.from]) {
      items[action.from].task = null;
    }
    movedItem.parent = null;
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

module.exports = exports = actions;