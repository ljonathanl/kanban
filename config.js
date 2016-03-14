var config = {
	host: "127.0.0.1",
	port: 8080,
	storage: "store/kanban.json"
}

var configOpenShift = {
	host: process.env.OPENSHIFT_NODEJS_IP,
	port: process.env.OPENSHIFT_NODEJS_PORT,
	storage: process.env.OPENSHIFT_DATA_DIR + "/kanban.json"
}

module.exports = exports = process.env.OPENSHIFT_NODEJS_PORT ? configOpenShift : config;