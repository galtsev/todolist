
window.render_root = require('./components').render_root;

window.todolist = {
	srv: require('./couch_server').srv,
	logme: function(obj){console.log(obj)}
}