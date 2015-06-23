
function Storage() {
	this.actions = {};
}

Storage.prototype.update_event = 'update';

Storage.prototype.mount = function(dispatcher) {
	for (var action_id in this.actions) {
		dispatcher.on(action_id, this.actions[action_id]);
	}
	this.updated = function() {dispatcher.emit(this.update_event, this)};
}

Storage.prototype.unmount = function(dispatcher) {
	for (var action_id in this.actions) {
		dispatcher.unlisten(action_id, this.actions[action_id]);
	}
	delete this.updated;
}

Storage.prototype.on = function(event, callback) {
	this.actions[event] = callback.bind(this);
}

exports.Storage = Storage;