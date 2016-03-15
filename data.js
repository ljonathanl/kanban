var config = require('./config');
var Storage = require('node-storage');

var store = new Storage(config.storage);

var kanban = store.get('kanban');

if (!kanban) {
  kanban = {items: [], archive: []};
  save();
}

var items = {};

function save() {
  store.put('kanban', kanban);
}

function load(newKanban) {
  kanban.items = newKanban.items;
  kanban.archive = newKanban.archive;
  for(var k in items) {
    delete items[k];
  }
  findItems(kanban.items);
  findItems(kanban.archive);
  save(); 
}

function findItems(tasks) {
  for (var i = 0; i < tasks.length; i++) {
    var item = tasks[i];
    items[item.id] = item;
    while(item.task) {
      item = item.task;
      items[item.id] = item;
    }
  }
} 

findItems(kanban.items);
findItems(kanban.archive); 


module.exports = exports = {
  kanban: kanban,
  items: items,
  save: save,
  load: load 
}