var kanban = null;

var items = {};

function add(item) {
	if (items[item.id]) {
		console.log("item already exists", item.id)
	} else {
		items[item.id] = item;
	}

}

function check(tasks) {
	for (var i = 0; i < tasks.length; i++) {
		var item = tasks[i];
		add(item);
		var parent = item.id;
		if (item.parent) {
			console.log("Bad parent", item.id)
		}
		while(item.task) {
		  item = item.task;
		  if (parent != item.parent) {
		  	console.log("Bad parent", item.id)
		  }
		  parent = item.id;
		  add(item);
		}
	}
}

check(kanban.items);
check(kanban.archive);