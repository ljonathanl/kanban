var kanban = {
  items: 
  [
    {type: 'task', title: 'My super task', id: 'tsk1', x: 20, y: 30}, 
    {type: 'task', title: 'My super task 2', id: 'tsk2', x: 50, y: 30},
    {type: 'task', title: 'My super task', id: 'tsk3', x: 80, y: 30},
    {type: 'task', title: 'My super task', id: 'tsk5', x: 20, y: 50},
    {type: 'task', title: 'My super task', id: 'tsk4', x: 10, y: 30},
  ]  
};

var items = {};

function findItems(kanban) {
  for (var i = 0; i < kanban.items.length; i++) {
    var item = kanban.items[i];
    items[item.id] = item;
  }
} 

findItems(kanban); 

module.exports = exports = {
  kanban: kanban,
  items: items 
}