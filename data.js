var kanban = {
  items: 
  [
    {title: 'Email Contact and Notify Subscribers', id: 'tsk1', x: 826, y: 64, category: "back"}, 
    {title: 'Clone Product', id: 'tsk2', x: 1231, y: 54, category: "cms"},
    {title: 'Show OPE version and environment type in the footer', id: 'tsk3', x: 1028, y: 41, category: "other"},
    {title: 'Update homepage carousel with Wordpress API evolutions', id: 'tsk5', x: 433, y: 80, category: "front"},
    {
      title: 'Partially show Client ID in Application details', id: 'tsk4', x: 214, y: 197, category: "back",
      task: {title: 'Partially show Client ID in Application details front', id: 'tsk6', x: 10, y: 30}
    },
  ]  
};

var items = {};

function findItems(kanban) {
  for (var i = 0; i < kanban.items.length; i++) {
    var item = kanban.items[i];
    items[item.id] = item;
    while(item.task) {
      item = item.task;
      items[item.id] = item;
    }
  }
}  

findItems(kanban); 

module.exports = exports = {
  kanban: kanban,
  items: items 
}