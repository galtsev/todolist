//nextTick implementation gratefully stealed at 
// http://timnew.me/blog/2014/06/23/process-nexttick-implementation-in-browser/
nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener;
    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }
    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }
    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

function Dispatcher() {
	this.listeners = {};
}

Dispatcher.prototype.on = function(eventId, handler) {
	var handlers = this.listeners[eventId]
	if (!handlers) {
		this.listeners[eventId] = handlers = [];
	}
	handlers.push(handler);
}

Dispatcher.prototype.unlisten = function(eventId, handler) {
	var handlers = this.listeners[eventId];
	if (handlers) {
		handlers = handlers.filter(function(h){return h!==handler});
		if (handlers) {
			this.listeners[eventId] = handlers;
		} else {
			delete this.listeners[eventId];
		}
	}
}

// cal handlers acynchronously
Dispatcher.prototype.emit = function(eventId, args) {
	nextTick(function() {
		var handlers = this.listeners[eventId];
		if (handlers) {
			handlers.forEach(function(h){h(args);});
		}
	}.bind(this));
}

exports.Dispatcher = Dispatcher;