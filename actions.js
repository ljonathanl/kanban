var data = require('./data');
var kanban = data.kanban;
var items = data.items;

function remove(items, item) {
	var index = items.indexOf(item)
	if (index !== -1) {
	  items.splice(index, 1)
	}
}

function removeFrom(item, fromId) {
  if (fromId == 'kanban') {
    remove(kanban.items, item);
  } else if (items[fromId]) {
    items[fromId].task = null;
  }
}

var actions = {
  move: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    removeFrom(movedItem, action.from);
    kanban.items.push(movedItem);
    movedItem.x = action.to.x;
    movedItem.y = action.to.y; 
    movedItem.parent = null;
  },
  add: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    var container = items[action.to];
    removeFrom(movedItem, action.from);
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
    for (var k in action.properties) {
      updatedItem[k] = action.properties[k];   
    }
  },
  archive: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    removeFrom(movedItem, action.from);
    movedItem.parent = null;
    kanban.archive.push(movedItem);
  },
  remove: function(action) {
    console.log(action);
    var movedItem = items[action.id];
    removeFrom(movedItem, action.from);
    var subTask = movedItem;
    while (subTask) {
      delete items[subTask.id];
      subTask = subTask.task;
    }
  },  
}

module.exports = exports = actions;