var data = require('./data');
var kanban = data.kanban;
var items = data.items;

var actions = {
  move: function(action) {
    var movedItem = items[action.id];
    var lastContainer = kanban[action.from.name].contents;
    var newContainer = kanban[action.to.name].contents;
    lastContainer.splice(action.from.index, 1);
    newContainer.splice(action.to.index, 0, movedItem);
  }
}

module.exports = exports = actions;