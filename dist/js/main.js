(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const StorageMixin = require('./todo_storage').DispatcherMixin;
const Settings = require('./settings').Settings;
const Link = require('./link').Link;

function f2(i) {
    return (i<10?'0':'')+i.toString();
}
function fmt_date(arg) {
    var dt = (typeof arg=='string')?new Date(Date.parse(arg)):arg;
    return dt.getFullYear() +'-'+f2(dt.getMonth()+1) +'-'+f2(dt.getDate()) + ' ' + dt.getHours() +':'+f2(dt.getMinutes()) +':'+f2(dt.getSeconds());
}

var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Button = ReactBootstrap.Button;
var DropdownButton = ReactBootstrap.DropdownButton;
var SplitButton = ReactBootstrap.SplitButton;
var MenuItem = ReactBootstrap.MenuItem;
var Input = ReactBootstrap.Input;

function upFirst(s) {
    return s.charAt(0).toUpperCase()+s.slice(1).toLowerCase();
}

function statusCaption(status) {
    return upFirst(status=='closed'?'done':status);
}

var TodoItem = React.createClass({displayName: "TodoItem",
    mixins: [StorageMixin],
    handleDelete: function(event) {
        this.emit('delete_item', this.props.task);
    },
    newStatusClick: function(event) {
        this.newStatusSelect(this.nextStatus());
    },
    newStatusSelect: function(status) {
        this.emit('update_item_status', {task: this.props.task, new_status: status});
    },
    nextStatus: function() {
        return this.props.task.status=='in process'?'closed':'in process';
    },
    render: function() {
        var otherStatuses = ['backlog','in process', 'hold', 'closed'].filter(function(status)  {return status!=this.nextStatus() && status!=this.props.view_status;}.bind(this));
        return (
            React.createElement("div", {className: "task"}, 
            React.createElement(ButtonToolbar, null, 
                React.createElement(SplitButton, {bsStyle: "default", title: statusCaption(this.nextStatus()), onClick: this.newStatusClick, onSelect: this.newStatusSelect}, 
                otherStatuses.map(function(status)  {return React.createElement(MenuItem, {eventKey: status, key: status}, statusCaption(status));})
                ), 
                React.createElement(Button, {bsStyle: "default", onClick: this.handleDelete}, "Delete")
            ), 
            React.createElement("div", {className: "description"}, this.props.task.description), 
            React.createElement("div", {className: "attrs"}, 
                React.createElement("span", {className: "float_left"},  fmt_date(this.props.task.date_updated) ), 
                React.createElement("span", {className: "float_right"}, this.props.task.status)
            ), 
            React.createElement("div", {className: "clear_both;"})
        )
        );
    }
});

var Dialog1 = React.createClass({displayName: "Dialog1",
    mixins: [StorageMixin],
    render: function() {
        return (
            React.createElement("div", {id: "d1", className: "g-modal-container"}, 
                React.createElement("h3", null, "Add new task"), 
                React.createElement(AppendForm, {view_status: this.props.opts})
            )
        );
    }
});

var Toolbar = React.createClass({displayName: "Toolbar",
    mixins: [StorageMixin],
    newSelect: function(status) {
        this.emit('view_status_changed', {status: status, search_value: this.refs.search_value.getValue().trim()});
    },
    showDialog: function(event) {
        //document.getElementById('d1').style.display='block';
        this.emit('show_dialog', {dialogClass: Dialog1, opts:this.props.view_status});
    },
    render: function() {
        var view_options = ['all', 'backlog', 'in process', 'hold', 'closed'];
        return (
            React.createElement("div", {className: "toolbox"}, 
                /*<button className="btn btn-default" type="button" data-toggle="collapse" data-target="#addnew2">New</button>*/
                React.createElement("button", {className: "btn btn-default", type: "button", onClick: this.showDialog}, "New"), 
                React.createElement(DropdownButton, {title: statusCaption(this.props.view_status), onSelect: this.newSelect}, 
                    view_options.map(function(status)
                        {return React.createElement(MenuItem, {eventKey: status, key: status}, statusCaption(status));})
                ), 
                React.createElement(Input, {type: "text", ref: "search_value", label: "Search"})
            )
        );
    }
});

var AppendForm = React.createClass({displayName: "AppendForm",
    mixins: [StorageMixin],
    handleSubmit: function() {
        var data = {
            status: this.refs.status.getDOMNode().value,
            description: this.refs.description.getDOMNode().value
        };
        this.emit('item_append', data);
        React.findDOMNode(this.refs.description).value='';
        this.emit('close_dialog');
    },
    handleCancel: function() {
        this.emit('close_dialog');
    },
    render: function() {
        return (
            React.createElement("div", {id: "addnew2", className: "__collapse"}, 
                React.createElement("div", null, 
                    React.createElement("textarea", {ref: "description", cols: "60", rows: "10"})
                ), 
                React.createElement("div", null, 
                    React.createElement("select", {ref: "status", defaultValue: this.props.view_status}, 
                        React.createElement("option", {value: "in process"}, "in process"), 
                        React.createElement("option", {value: "backlog"}, "backlog"), 
                        React.createElement("option", {value: "hold"}, "hold"), 
                        React.createElement("option", {value: "closed"}, "closed")
                    )
                ), 
                React.createElement("div", null, 
                    React.createElement("button", {className: "btn btn-default", onClick: this.handleSubmit}, "Submit"), 
                    React.createElement("button", {className: "btn btn-default", onClick: this.handleCancel}, "Cancel")
                )
            )
        );
    }
});

const TodoList = React.createClass({displayName: "TodoList",
    render: function() {
        var items = this.props.todos.map(function(task) {
            return React.createElement(TodoItem, {
                        task: task, 
                        view_status: this.props.view_status, 
                        key: task.id});
        }.bind(this));
        return (
            React.createElement("div", null, 
            items
            )
        );

    }
});


var TodoPage = React.createClass({displayName: "TodoPage",
    mixins: [StorageMixin],
    getInitialState: function() {
        return {
            view_status: 'in process',
            todos: [],
            dialog: null,
            path: 'home'
        };
    },
    componentDidMount: function() {
        this.emit('initial_load');
        //storage.on('update', this.storageUpdated);
    },
    storageUpdated: function(storage) {
        s = storage.state;
        new_state = {
            view_status: s.status,
            todos: s.todos,
            dialog: s.dialog,
            path: s.path
        };
        this.setState(new_state);
    },
    render: function() {
        var dialog;
        if (this.state.dialog) {
            var D = this.state.dialog.dialogClass;
            dialog = React.createElement(D, {opts: this.state.dialog.opts});
        } else {
            dialog = React.createElement("div", null);
        }
        var page;
        if (this.state.path=='home') {
            page = (
            React.createElement("div", null, 
                dialog, 
                React.createElement(Link, {path: "settings"}, "Settings"), 
                React.createElement(Toolbar, {view_status: this.state.view_status}), 
                React.createElement(TodoList, {todos: this.state.todos, view_status: this.state.view_status})
            )
            );
        } else {
            page = React.createElement(Settings, null);
        }
        return page;
    }
});

exports.render_root = function() {
    React.render(React.createElement(TodoPage, null), document.getElementById('list'));
}
},{"./link":5,"./settings":6,"./todo_storage":8}],2:[function(require,module,exports){
const strftime = require('strftime');

const conn_str = 'todo_local';

function Server(conn_str, opts) {
    this.backend = PouchDB(conn_str, opts);
}

function srv2local(todo) {
    todo.id=todo._id;
    return todo;
}

function findAll(regEx, s) {
    var res = [];
    regEx.lastIndex=0;
    while (m=regEx.exec(s)) {
        res.push(m[0]);
    }
    return res;
}

const date_format = "%Y-%m-%d %H:%M:%S.%L";

function echo(msg) {
    return function(value) {
        console.log(msg, value);
    }
}

function error(msg) {
    return function(value) {
        console.error(msg, value);
    }
}



Server.prototype = {
    create_views: function() {
        var main = {
            _id: '_design/main',
            views: {
                all_by_date_updated: {
                    map: function(doc){emit(doc.date_updated, null);}.toString()
                },
                by_status_date_updated: {
                    map: function(doc){emit([doc.status,doc.date_updated],null);}.toString()
                },
                by_tag_status_date_updated: {
                    map: function(doc){doc.tags.forEach(function(tag){emit([tag,doc.status,doc.date_updated],null);});}.toString()
                }
            }
        };
        this.backend.put(main).then(function(){console.log('ok')}).catch(function(err){console.error(err);});
    },
    sync: function(args){
        var backend = this.backend;
        const settings_key = '_local/settings_remote';
        var save = function(doc) {
            delete args.password;
            args._id = settings_key;
            args.last_sync_date = strftime(date_format, new Date());
            if (doc) {
                args._rev=doc._rev
            }
            backend.put(args);
        };
        var onComplete = function() {
            backend.get(settings_key)
                .then(save)
                .catch(function(err){
                    if (err.status==404) {save(null);}
                })
        };
        var remote = new PouchDB(args.url, {auth: {username:args.username,password:args.password}});
        this.backend.sync(remote)
            .on('complete', onComplete)
            .on('error', error('error handler called'));
    },
    set_status: function(todo, status) {
        //return this.post_promise('set-status', {id: id, status: status});
        var obj = {
            _id: todo.id,
            _rev: todo._rev,
            date_created: todo.date_created,
            date_updated: strftime(date_format, new Date()),
            tags: todo.tags,
            description: todo.description,
            status: status
        };
        return this.backend.put(obj);
    },
    get_list: function(options) {
        var view = 'main/all_by_date_updated';
        var startkey = {};
        var endkey = '';
        if (options.status!='all') {
            if (options.search_value) {
                view = 'main/by_tag_status_date_updated';
                startkey = [options.search_value, options.status, {}];
                endkey = [options.search_value, options.status];
            } else {
                view = 'main/by_status_date_updated';
                startkey = [options.status, {}];
                endkey = [options.status]
            }
        }
        return this.backend.query(view, {descending: true, startkey:startkey,include_docs:true,reduce:false,endkey:endkey})
            .then(function(data){return data.rows.map(function(row){return srv2local(row.doc);});});
    },
    add_todo: function(form_data) {
        var now = new Date();
        form_data.date_created = form_data.date_updated = strftime(date_format, now);
        form_data.tags = findAll(/#\w+(?:\.\w+)*/g, form_data.description);
        return this.backend.post(form_data)
            .then(function(data){return this.backend.get(data.id);}.bind(this))
            .then(function(todo){return srv2local(todo)});
    },
    delete_task: function(task) {
        //return this.post_promise('delete_task', {id: id});
        return this.backend.remove(task);
    }

}

//exports.srv = new Server('http://admin:admin@localhost:5984/todo');
exports.srv = new Server(conn_str);

},{"strftime":9}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){

window.render_root = require('./components').render_root;

window.todolist = {
	srv: require('./couch_server').srv
}
},{"./components":1,"./couch_server":2}],5:[function(require,module,exports){
const StorageMixin = require('./todo_storage').DispatcherMixin;

exports.Link = React.createClass({displayName: "Link",
    mixins: [StorageMixin],
    handleClick: function() {
        this.emit('link', this.props.path);
    },
    render: function(){
        return (
            React.createElement("a", {href: "#", onClick: this.handleClick}, this.props.children)
            );
    }
});


},{"./todo_storage":8}],6:[function(require,module,exports){
const StorageMixin = require('./todo_storage').DispatcherMixin;
const Link = require('./link').Link;
const srv = require('./couch_server').srv;

exports.Settings = React.createClass({displayName: "Settings",
    mixins: [StorageMixin],
	createViews: function(){
		this.emit('create_views');
	},
	sync: function(){
		var args = {
			url: React.findDOMNode(this.refs.replication_url).value,
			username: React.findDOMNode(this.refs.username).value,
			password: React.findDOMNode(this.refs.password).value
		};
		this.emit('sync', args);
	},
	componentDidMount: function() {
		this.emit('get_sync_params', function(params){
			React.findDOMNode(this.refs.replication_url).value=params.url;
			React.findDOMNode(this.refs.username).value=params.username;
		}.bind(this));
	},
    render: function(){
        return (
            React.createElement("div", null, 
                React.createElement(Link, {path: "home"}, "Home"), 
                React.createElement("h2", null, "Settings page"), 
                React.createElement("div", null, 
                	React.createElement("a", {href: "#", onClick: this.createViews}, "Create views")
                ), 
            	React.createElement("h3", null, "Replication"), 
            	React.createElement("div", null, 
	            	React.createElement("label", null, "server url"), 
	            	React.createElement("input", {name: "replication_url", type: "text", ref: "replication_url", size: "40"})
	            ), 
	            React.createElement("div", null, 
	            	React.createElement("label", null, "username"), 
	            	React.createElement("input", {name: "username", type: "text", ref: "username", defaultValue: "admin", size: "30"})
	            ), 
	            React.createElement("div", null, 
	            	React.createElement("label", null, "password"), 
	            	React.createElement("input", {name: "password", type: "password", ref: "password", size: "30"})
	            ), 
	            React.createElement("button", {onClick: this.sync}, "Sync")
            )
        );
    }
});

},{"./couch_server":2,"./link":5,"./todo_storage":8}],7:[function(require,module,exports){

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
},{}],8:[function(require,module,exports){

// var EventEmitter = require('events').EventEmitter;
// var assert = require('assert');
//var srv = require('./server').srv;
var srv = require('./couch_server').srv;
var Storage = require('./storage').Storage;
var Dispatcher = require('./dispatcher').Dispatcher;

//dispatcher = new EventEmitter();

//storage = new EventEmitter();
storage = new Storage();

storage.state = {
    status: 'in process',
    todos: [],
    path: 'home'
};

storage.on('create_views', function(){
    srv.create_views();
    console.log('ok');
});

storage.on('initial_load', function() {
    srv.get_list({status: this.state.status, search_value:''}).then(function(data){
        this.state.todos = data;
        this.state.status = this.state.status;
        this.updated();
    }.bind(this));
});

storage.on('update_item_status', function(data) {
    var pred = function(todo){
        return this.state.status=='all' || data.new_status==this.state.status || todo.id!=data.task.id;
    }.bind(this);
    srv.set_status(data.task, data.new_status).then(function() {
        this.state.todos = this.state.todos.filter(pred);
        this.updated();
    }.bind(this));
});

storage.on('view_status_changed', function(options){
    srv.get_list(options).then(function(data){
        this.state.todos = data;
        this.state.status = options.status;
        this.updated();
    }.bind(this));
});

storage.on('item_append',  function(data) {
    srv.add_todo(data).then(function(items){
        if (data.status==this.state.status || this.state.status=='all') {
            this.state.todos = [items].concat(this.state.todos);
            this.updated();
        }
    }.bind(this));
});

storage.on('delete_item', function(todo) {
    srv.delete_task(todo).then(function() {
        this.state.todos = this.state.todos.filter(function(t2){return t2.id!=todo.id});
        this.updated();
    }.bind(this));
});

storage.on('show_dialog', function(opts){
    this.state.dialog = opts;
    console.log('show_dialog', opts);
    this.updated();
});

storage.on('close_dialog', function(){
    this.state.dialog = null;
    this.updated();
});

storage.on('link', function(path){
    this.state.path=path;
    this.updated();
});

storage.on('sync', function(args){
    srv.sync(args);
    this.updated();
});

storage.on('get_sync_params', function(callback){
    srv.backend.get('_local/settings_remote')
        .then(callback);
});

var dispatcher = new Dispatcher();
storage.mount(dispatcher);

exports.DispatcherMixin = {
    emit: function(event, options) {
        dispatcher.emit(event, options);
    },
    componentWillMount: function() {
        if (this.storageUpdated) {
            dispatcher.on('update', this.storageUpdated);
        }
    },
    componentWillUnmount: function() {
        if (this.storageUpdated) {
            dispatcher.unlisten('update', this.storageUpdated);
        }
    }
}


},{"./couch_server":2,"./dispatcher":3,"./storage":7}],9:[function(require,module,exports){
//
// strftime
// github.com/samsonjs/strftime
// @_sjs
//
// Copyright 2010 - 2015 Sami Samhuri <sami@samhuri.net>
//
// MIT License
// http://sjs.mit-license.org
//

;(function() {

    var DefaultLocale = {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            AM: 'AM',
            PM: 'PM',
            am: 'am',
            pm: 'pm',
            formats: {
                D: '%m/%d/%y',
                F: '%Y-%m-%d',
                R: '%H:%M',
                T: '%H:%M:%S',
                X: '%T',
                c: '%a %b %d %X %Y',
                r: '%I:%M:%S %p',
                v: '%e-%b-%Y',
                x: '%D'
            }
        },
        defaultStrftime = new Strftime(DefaultLocale, 0, false),
        isCommonJS = typeof module !== 'undefined',
        namespace;

    // CommonJS / Node module
    if (isCommonJS) {
        namespace = module.exports = adaptedStrftime;
        namespace.strftime = deprecatedStrftime;
    }
    // Browsers and other environments
    else {
        // Get the global object. Works in ES3, ES5, and ES5 strict mode.
        namespace = (function() { return this || (1,eval)('this'); }());
        namespace.strftime = adaptedStrftime;
    }

    // Deprecated API, to be removed in v1.0
    var _require = isCommonJS ? "require('strftime')" : "strftime";
    var _deprecationWarnings = {};
    function deprecationWarning(name, instead) {
        if (!_deprecationWarnings[name]) {
            if (typeof console !== 'undefined' && typeof console.warn == 'function') {
                console.warn("[WARNING] " + name + " is deprecated and will be removed in version 1.0. Instead, use `" + instead + "`.");
            }
            _deprecationWarnings[name] = true;
        }
    }

    namespace.strftimeTZ = deprecatedStrftimeTZ;
    namespace.strftimeUTC = deprecatedStrftimeUTC;
    namespace.localizedStrftime = deprecatedStrftimeLocalized;

    // Adapt the old API while preserving the new API.
    function adaptForwards(fn) {
        fn.localize = defaultStrftime.localize.bind(defaultStrftime);
        fn.timezone = defaultStrftime.timezone.bind(defaultStrftime);
        fn.utc = defaultStrftime.utc.bind(defaultStrftime);
    }

    adaptForwards(adaptedStrftime);
    function adaptedStrftime(fmt, d, locale) {
        // d and locale are optional, check if this is (format, locale)
        if (d && d.days) {
            locale = d;
            d = undefined;
        }
        if (locale) {
            deprecationWarning("`" + _require + "(format, [date], [locale])`", "var s = " + _require + ".localize(locale); s(format, [date])");
        }
        var strftime = locale ? defaultStrftime.localize(locale) : defaultStrftime;
        return strftime(fmt, d);
    }

    adaptForwards(deprecatedStrftime);
    function deprecatedStrftime(fmt, d, locale) {
        if (locale) {
            deprecationWarning("`" + _require + ".strftime(format, [date], [locale])`", "var s = " + _require + ".localize(locale); s(format, [date])");
        }
        else {
            deprecationWarning("`" + _require + ".strftime(format, [date])`", _require + "(format, [date])");
        }
        var strftime = locale ? defaultStrftime.localize(locale) : defaultStrftime;
        return strftime(fmt, d);
    }

    function deprecatedStrftimeTZ(fmt, d, locale, timezone) {
        // locale is optional, check if this is (format, date, timezone)
        if ((typeof locale == 'number' || typeof locale == 'string') && timezone == null) {
            timezone = locale;
            locale = undefined;
        }

        if (locale) {
            deprecationWarning("`" + _require + ".strftimeTZ(format, date, locale, tz)`", "var s = " + _require + ".localize(locale).timezone(tz); s(format, [date])` or `var s = " + _require + ".localize(locale); s.timezone(tz)(format, [date])");
        }
        else {
            deprecationWarning("`" + _require + ".strftimeTZ(format, date, tz)`", "var s = " + _require + ".timezone(tz); s(format, [date])` or `" + _require + ".timezone(tz)(format, [date])");
        }

        var strftime = (locale ? defaultStrftime.localize(locale) : defaultStrftime).timezone(timezone);
        return strftime(fmt, d);
    }

    var utcStrftime = defaultStrftime.utc();
    function deprecatedStrftimeUTC(fmt, d, locale) {
        if (locale) {
            deprecationWarning("`" + _require + ".strftimeUTC(format, date, locale)`", "var s = " + _require + ".localize(locale).utc(); s(format, [date])");
        }
        else {
            deprecationWarning("`" + _require + ".strftimeUTC(format, [date])`", "var s = " + _require + ".utc(); s(format, [date])");
        }
        var strftime = locale ? utcStrftime.localize(locale) : utcStrftime;
        return strftime(fmt, d);
    }

    function deprecatedStrftimeLocalized(locale) {
        deprecationWarning("`" + _require + ".localizedStrftime(locale)`", _require + ".localize(locale)");
        return defaultStrftime.localize(locale);
    }
    // End of deprecated API

    // Polyfill Date.now for old browsers.
    if (typeof Date.now !== 'function') {
        Date.now = function() {
          return +new Date();
        };
    }

    function Strftime(locale, customTimezoneOffset, useUtcTimezone) {
        var _locale = locale || DefaultLocale,
            _customTimezoneOffset = customTimezoneOffset || 0,
            _useUtcBasedDate = useUtcTimezone || false,

            // we store unix timestamp value here to not create new Date() each iteration (each millisecond)
            // Date.now() is 2 times faster than new Date()
            // while millisecond precise is enough here
            // this could be very helpful when strftime triggered a lot of times one by one
            _cachedDateTimestamp = 0,
            _cachedDate;

        function _strftime(format, date) {
            var timestamp;

            if (!date) {
                var currentTimestamp = Date.now();
                if (currentTimestamp > _cachedDateTimestamp) {
                    _cachedDateTimestamp = currentTimestamp;
                    _cachedDate = new Date(_cachedDateTimestamp);

                    timestamp = _cachedDateTimestamp;

                    if (_useUtcBasedDate) {
                        // how to avoid duplication of date instantiation for utc here?
                        // we tied to getTimezoneOffset of the current date
                        _cachedDate = new Date(_cachedDateTimestamp + getTimestampToUtcOffsetFor(_cachedDate) + _customTimezoneOffset);
                    }
                }
                else {
                  timestamp = _cachedDateTimestamp;
                }
                date = _cachedDate;
            }
            else {
                timestamp = date.getTime();

                if (_useUtcBasedDate) {
                    date = new Date(date.getTime() + getTimestampToUtcOffsetFor(date) + _customTimezoneOffset);
                }
            }

            return _processFormat(format, date, _locale, timestamp);
        }

        function _processFormat(format, date, locale, timestamp) {
            var resultString = '',
                padding = null,
                isInScope = false,
                length = format.length,
                extendedTZ = false;

            for (var i = 0; i < length; i++) {

                var currentCharCode = format.charCodeAt(i);

                if (isInScope === true) {
                    // '-'
                    if (currentCharCode === 45) {
                        padding = '';
                        continue;
                    }
                    // '_'
                    else if (currentCharCode === 95) {
                        padding = ' ';
                        continue;
                    }
                    // '0'
                    else if (currentCharCode === 48) {
                        padding = '0';
                        continue;
                    }
                    // ':'
                    else if (currentCharCode === 58) {
                      if (extendedTZ) {
                        if (typeof console !== 'undefined' && typeof console.warn == 'function') {
                          console.warn("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime");
                        }
                      }
                      extendedTZ = true;
                      continue;
                    }

                    switch (currentCharCode) {

                        // Examples for new Date(0) in GMT

                        // 'Thursday'
                        // case 'A':
                        case 65:
                            resultString += locale.days[date.getDay()];
                            break;

                        // 'January'
                        // case 'B':
                        case 66:
                            resultString += locale.months[date.getMonth()];
                            break;

                        // '19'
                        // case 'C':
                        case 67:
                            resultString += padTill2(Math.floor(date.getFullYear() / 100), padding);
                            break;

                        // '01/01/70'
                        // case 'D':
                        case 68:
                            resultString += _processFormat(locale.formats.D, date, locale, timestamp);
                            break;

                        // '1970-01-01'
                        // case 'F':
                        case 70:
                            resultString += _processFormat(locale.formats.F, date, locale, timestamp);
                            break;

                        // '00'
                        // case 'H':
                        case 72:
                            resultString += padTill2(date.getHours(), padding);
                            break;

                        // '12'
                        // case 'I':
                        case 73:
                            resultString += padTill2(hours12(date.getHours()), padding);
                            break;

                        // '000'
                        // case 'L':
                        case 76:
                            resultString += padTill3(Math.floor(timestamp % 1000));
                            break;

                        // '00'
                        // case 'M':
                        case 77:
                            resultString += padTill2(date.getMinutes(), padding);
                            break;

                        // 'am'
                        // case 'P':
                        case 80:
                            resultString += date.getHours() < 12 ? locale.am : locale.pm;
                            break;

                        // '00:00'
                        // case 'R':
                        case 82:
                            resultString += _processFormat(locale.formats.R, date, locale, timestamp);
                            break;

                        // '00'
                        // case 'S':
                        case 83:
                            resultString += padTill2(date.getSeconds(), padding);
                            break;

                        // '00:00:00'
                        // case 'T':
                        case 84:
                            resultString += _processFormat(locale.formats.T, date, locale, timestamp);
                            break;

                        // '00'
                        // case 'U':
                        case 85:
                            resultString += padTill2(weekNumber(date, 'sunday'), padding);
                            break;

                        // '00'
                        // case 'W':
                        case 87:
                            resultString += padTill2(weekNumber(date, 'monday'), padding);
                            break;

                        // '16:00:00'
                        // case 'X':
                        case 88:
                            resultString += _processFormat(locale.formats.X, date, locale, timestamp);
                            break;

                        // '1970'
                        // case 'Y':
                        case 89:
                            resultString += date.getFullYear();
                            break;

                        // 'GMT'
                        // case 'Z':
                        case 90:
                            if (_useUtcBasedDate && _customTimezoneOffset === 0) {
                                resultString += "GMT";
                            }
                            else {
                                // fixme optimize
                                var tzString = date.toString().match(/\(([\w\s]+)\)/);
                                resultString += tzString && tzString[1] || '';
                            }
                            break;

                        // 'Thu'
                        // case 'a':
                        case 97:
                            resultString += locale.shortDays[date.getDay()];
                            break;

                        // 'Jan'
                        // case 'b':
                        case 98:
                            resultString += locale.shortMonths[date.getMonth()];
                            break;

                        // ''
                        // case 'c':
                        case 99:
                            resultString += _processFormat(locale.formats.c, date, locale, timestamp);
                            break;

                        // '01'
                        // case 'd':
                        case 100:
                            resultString += padTill2(date.getDate(), padding);
                            break;

                        // ' 1'
                        // case 'e':
                        case 101:
                            resultString += padTill2(date.getDate(), padding == null ? ' ' : padding);
                            break;

                        // 'Jan'
                        // case 'h':
                        case 104:
                            resultString += locale.shortMonths[date.getMonth()];
                            break;

                        // '000'
                        // case 'j':
                        case 106:
                            var y = new Date(date.getFullYear(), 0, 1);
                            var day = Math.ceil((date.getTime() - y.getTime()) / (1000 * 60 * 60 * 24));
                            resultString += padTill3(day);
                            break;

                        // ' 0'
                        // case 'k':
                        case 107:
                            resultString += padTill2(date.getHours(), padding == null ? ' ' : padding);
                            break;

                        // '12'
                        // case 'l':
                        case 108:
                            resultString += padTill2(hours12(date.getHours()), padding == null ? ' ' : padding);
                            break;

                        // '01'
                        // case 'm':
                        case 109:
                            resultString += padTill2(date.getMonth() + 1, padding);
                            break;

                        // '\n'
                        // case 'n':
                        case 110:
                            resultString += '\n';
                            break;

                        // '1st'
                        // case 'o':
                        case 111:
                            resultString += String(date.getDate()) + ordinal(date.getDate());
                            break;

                        // 'AM'
                        // case 'p':
                        case 112:
                            resultString += date.getHours() < 12 ? locale.AM : locale.PM;
                            break;

                        // '12:00:00 AM'
                        // case 'r':
                        case 114:
                            resultString += _processFormat(locale.formats.r, date, locale, timestamp);
                            break;

                        // '0'
                        // case 's':
                        case 115:
                            resultString += Math.floor(timestamp / 1000);
                            break;

                        // '\t'
                        // case 't':
                        case 116:
                            resultString += '\t';
                            break;

                        // '4'
                        // case 'u':
                        case 117:
                            var day = date.getDay();
                            resultString += day === 0 ? 7 : day;
                            break; // 1 - 7, Monday is first day of the week

                        // ' 1-Jan-1970'
                        // case 'v':
                        case 118:
                            resultString += _processFormat(locale.formats.v, date, locale, timestamp);
                            break;

                        // '4'
                        // case 'w':
                        case 119:
                            resultString += date.getDay();
                            break; // 0 - 6, Sunday is first day of the week

                        // '12/31/69'
                        // case 'x':
                        case 120:
                            resultString += _processFormat(locale.formats.x, date, locale, timestamp);
                            break;

                        // '70'
                        // case 'y':
                        case 121:
                            resultString += ('' + date.getFullYear()).slice(2);
                            break;

                        // '+0000'
                        // case 'z':
                        case 122:
                            if (_useUtcBasedDate && _customTimezoneOffset === 0) {
                                resultString += extendedTZ ? "+00:00" : "+0000";
                            }
                            else {
                                var off;
                                if (_customTimezoneOffset !== 0) {
                                    off = _customTimezoneOffset / (60 * 1000);
                                }
                                else {
                                    off = -date.getTimezoneOffset();
                                }
                                var sign = off < 0 ? '-' : '+';
                                var sep = extendedTZ ? ':' : '';
                                var hours = Math.floor(Math.abs(off / 60));
                                var mins = Math.abs(off % 60);
                                resultString += sign + padTill2(hours) + sep + padTill2(mins);
                            }
                            break;

                        default:
                            resultString += format[i];
                            break;
                    }

                    padding = null;
                    isInScope = false;
                    continue;
                }

                // '%'
                if (currentCharCode === 37) {
                    isInScope = true;
                    continue;
                }

                resultString += format[i];
            }

            return resultString;
        }

        var strftime = _strftime;

        strftime.localize = function(locale) {
            return new Strftime(locale || _locale, _customTimezoneOffset, _useUtcBasedDate);
        };

        strftime.timezone = function(timezone) {
            var customTimezoneOffset = _customTimezoneOffset;
            var useUtcBasedDate = _useUtcBasedDate;

            var timezoneType = typeof timezone;
            if (timezoneType === 'number' || timezoneType === 'string') {
                useUtcBasedDate = true;

                // ISO 8601 format timezone string, [-+]HHMM
                if (timezoneType === 'string') {
                    var sign = timezone[0] === '-' ? -1 : 1,
                        hours = parseInt(timezone.slice(1, 3), 10),
                        minutes = parseInt(timezone.slice(3, 5), 10);

                    customTimezoneOffset = sign * ((60 * hours) + minutes) * 60 * 1000;
                    // in minutes: 420
                }
                else if (timezoneType === 'number') {
                    customTimezoneOffset = timezone * 60 * 1000;
                }
            }

            return new Strftime(_locale, customTimezoneOffset, useUtcBasedDate);
        };

        strftime.utc = function() {
            return new Strftime(_locale, _customTimezoneOffset, true);
        };

        return strftime;
    }

    function padTill2(numberToPad, paddingChar) {
        if (paddingChar === '' || numberToPad > 9) {
            return numberToPad;
        }
        if (paddingChar == null) {
            paddingChar = '0';
        }
        return paddingChar + numberToPad;
    }

    function padTill3(numberToPad) {
        if (numberToPad > 99) {
            return numberToPad;
        }
        if (numberToPad > 9) {
            return '0' + numberToPad;
        }
        return '00' + numberToPad;
    }

    function hours12(hour) {
        if (hour === 0) {
            return 12;
        }
        else if (hour > 12) {
            return hour - 12;
        }
        return hour;
    }

    // firstWeekday: 'sunday' or 'monday', default is 'sunday'
    //
    // Pilfered & ported from Ruby's strftime implementation.
    function weekNumber(date, firstWeekday) {
        firstWeekday = firstWeekday || 'sunday';

        // This works by shifting the weekday back by one day if we
        // are treating Monday as the first day of the week.
        var weekday = date.getDay();
        if (firstWeekday === 'monday') {
            if (weekday === 0) // Sunday
                weekday = 6;
            else
                weekday--;
        }

        var firstDayOfYearUtc = Date.UTC(date.getFullYear(), 0, 1),
            dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
            yday = Math.floor((dateUtc - firstDayOfYearUtc) / 86400000),
            weekNum = (yday + 7 - weekday) / 7;

        return Math.floor(weekNum);
    }

    // Get the ordinal suffix for a number: st, nd, rd, or th
    function ordinal(number) {
        var i = number % 10;
        var ii = number % 100;

        if ((ii >= 11 && ii <= 13) || i === 0 || i >= 4) {
            return 'th';
        }
        switch (i) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
        }
    }

    function getTimestampToUtcOffsetFor(date) {
        return (date.getTimezoneOffset() || 0) * 60000;
    }

}());

},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Rhbi9naXQvdG9kb2xpc3Qvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZGFuL2dpdC90b2RvbGlzdC9idWlsZC9qcy9jb21wb25lbnRzLmpzIiwiL2hvbWUvZGFuL2dpdC90b2RvbGlzdC9idWlsZC9qcy9jb3VjaF9zZXJ2ZXIuanMiLCIvaG9tZS9kYW4vZ2l0L3RvZG9saXN0L2J1aWxkL2pzL2Rpc3BhdGNoZXIuanMiLCIvaG9tZS9kYW4vZ2l0L3RvZG9saXN0L2J1aWxkL2pzL2Zha2VfOWMzZDE5MDguanMiLCIvaG9tZS9kYW4vZ2l0L3RvZG9saXN0L2J1aWxkL2pzL2xpbmsuanMiLCIvaG9tZS9kYW4vZ2l0L3RvZG9saXN0L2J1aWxkL2pzL3NldHRpbmdzLmpzIiwiL2hvbWUvZGFuL2dpdC90b2RvbGlzdC9idWlsZC9qcy9zdG9yYWdlLmpzIiwiL2hvbWUvZGFuL2dpdC90b2RvbGlzdC9idWlsZC9qcy90b2RvX3N0b3JhZ2UuanMiLCIvaG9tZS9kYW4vZ2l0L3RvZG9saXN0L25vZGVfbW9kdWxlcy9zdHJmdGltZS9zdHJmdGltZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBTdG9yYWdlTWl4aW4gPSByZXF1aXJlKCcuL3RvZG9fc3RvcmFnZScpLkRpc3BhdGNoZXJNaXhpbjtcbmNvbnN0IFNldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpLlNldHRpbmdzO1xuY29uc3QgTGluayA9IHJlcXVpcmUoJy4vbGluaycpLkxpbms7XG5cbmZ1bmN0aW9uIGYyKGkpIHtcbiAgICByZXR1cm4gKGk8MTA/JzAnOicnKStpLnRvU3RyaW5nKCk7XG59XG5mdW5jdGlvbiBmbXRfZGF0ZShhcmcpIHtcbiAgICB2YXIgZHQgPSAodHlwZW9mIGFyZz09J3N0cmluZycpP25ldyBEYXRlKERhdGUucGFyc2UoYXJnKSk6YXJnO1xuICAgIHJldHVybiBkdC5nZXRGdWxsWWVhcigpICsnLScrZjIoZHQuZ2V0TW9udGgoKSsxKSArJy0nK2YyKGR0LmdldERhdGUoKSkgKyAnICcgKyBkdC5nZXRIb3VycygpICsnOicrZjIoZHQuZ2V0TWludXRlcygpKSArJzonK2YyKGR0LmdldFNlY29uZHMoKSk7XG59XG5cbnZhciBCdXR0b25Ub29sYmFyID0gUmVhY3RCb290c3RyYXAuQnV0dG9uVG9vbGJhcjtcbnZhciBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG52YXIgRHJvcGRvd25CdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5Ecm9wZG93bkJ1dHRvbjtcbnZhciBTcGxpdEJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLlNwbGl0QnV0dG9uO1xudmFyIE1lbnVJdGVtID0gUmVhY3RCb290c3RyYXAuTWVudUl0ZW07XG52YXIgSW5wdXQgPSBSZWFjdEJvb3RzdHJhcC5JbnB1dDtcblxuZnVuY3Rpb24gdXBGaXJzdChzKSB7XG4gICAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkrcy5zbGljZSgxKS50b0xvd2VyQ2FzZSgpO1xufVxuXG5mdW5jdGlvbiBzdGF0dXNDYXB0aW9uKHN0YXR1cykge1xuICAgIHJldHVybiB1cEZpcnN0KHN0YXR1cz09J2Nsb3NlZCc/J2RvbmUnOnN0YXR1cyk7XG59XG5cbnZhciBUb2RvSXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJUb2RvSXRlbVwiLFxuICAgIG1peGluczogW1N0b3JhZ2VNaXhpbl0sXG4gICAgaGFuZGxlRGVsZXRlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB0aGlzLmVtaXQoJ2RlbGV0ZV9pdGVtJywgdGhpcy5wcm9wcy50YXNrKTtcbiAgICB9LFxuICAgIG5ld1N0YXR1c0NsaWNrOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB0aGlzLm5ld1N0YXR1c1NlbGVjdCh0aGlzLm5leHRTdGF0dXMoKSk7XG4gICAgfSxcbiAgICBuZXdTdGF0dXNTZWxlY3Q6IGZ1bmN0aW9uKHN0YXR1cykge1xuICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZV9pdGVtX3N0YXR1cycsIHt0YXNrOiB0aGlzLnByb3BzLnRhc2ssIG5ld19zdGF0dXM6IHN0YXR1c30pO1xuICAgIH0sXG4gICAgbmV4dFN0YXR1czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnRhc2suc3RhdHVzPT0naW4gcHJvY2Vzcyc/J2Nsb3NlZCc6J2luIHByb2Nlc3MnO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG90aGVyU3RhdHVzZXMgPSBbJ2JhY2tsb2cnLCdpbiBwcm9jZXNzJywgJ2hvbGQnLCAnY2xvc2VkJ10uZmlsdGVyKGZ1bmN0aW9uKHN0YXR1cykgIHtyZXR1cm4gc3RhdHVzIT10aGlzLm5leHRTdGF0dXMoKSAmJiBzdGF0dXMhPXRoaXMucHJvcHMudmlld19zdGF0dXM7fS5iaW5kKHRoaXMpKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJ0YXNrXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQnV0dG9uVG9vbGJhciwgbnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTcGxpdEJ1dHRvbiwge2JzU3R5bGU6IFwiZGVmYXVsdFwiLCB0aXRsZTogc3RhdHVzQ2FwdGlvbih0aGlzLm5leHRTdGF0dXMoKSksIG9uQ2xpY2s6IHRoaXMubmV3U3RhdHVzQ2xpY2ssIG9uU2VsZWN0OiB0aGlzLm5ld1N0YXR1c1NlbGVjdH0sIFxuICAgICAgICAgICAgICAgIG90aGVyU3RhdHVzZXMubWFwKGZ1bmN0aW9uKHN0YXR1cykgIHtyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChNZW51SXRlbSwge2V2ZW50S2V5OiBzdGF0dXMsIGtleTogc3RhdHVzfSwgc3RhdHVzQ2FwdGlvbihzdGF0dXMpKTt9KVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQnV0dG9uLCB7YnNTdHlsZTogXCJkZWZhdWx0XCIsIG9uQ2xpY2s6IHRoaXMuaGFuZGxlRGVsZXRlfSwgXCJEZWxldGVcIilcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImRlc2NyaXB0aW9uXCJ9LCB0aGlzLnByb3BzLnRhc2suZGVzY3JpcHRpb24pLCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJhdHRyc1wifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJmbG9hdF9sZWZ0XCJ9LCAgZm10X2RhdGUodGhpcy5wcm9wcy50YXNrLmRhdGVfdXBkYXRlZCkgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJmbG9hdF9yaWdodFwifSwgdGhpcy5wcm9wcy50YXNrLnN0YXR1cylcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNsZWFyX2JvdGg7XCJ9KVxuICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBEaWFsb2cxID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkRpYWxvZzFcIixcbiAgICBtaXhpbnM6IFtTdG9yYWdlTWl4aW5dLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtpZDogXCJkMVwiLCBjbGFzc05hbWU6IFwiZy1tb2RhbC1jb250YWluZXJcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoM1wiLCBudWxsLCBcIkFkZCBuZXcgdGFza1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChBcHBlbmRGb3JtLCB7dmlld19zdGF0dXM6IHRoaXMucHJvcHMub3B0c30pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBUb29sYmFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlRvb2xiYXJcIixcbiAgICBtaXhpbnM6IFtTdG9yYWdlTWl4aW5dLFxuICAgIG5ld1NlbGVjdDogZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgICAgIHRoaXMuZW1pdCgndmlld19zdGF0dXNfY2hhbmdlZCcsIHtzdGF0dXM6IHN0YXR1cywgc2VhcmNoX3ZhbHVlOiB0aGlzLnJlZnMuc2VhcmNoX3ZhbHVlLmdldFZhbHVlKCkudHJpbSgpfSk7XG4gICAgfSxcbiAgICBzaG93RGlhbG9nOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAvL2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkMScpLnN0eWxlLmRpc3BsYXk9J2Jsb2NrJztcbiAgICAgICAgdGhpcy5lbWl0KCdzaG93X2RpYWxvZycsIHtkaWFsb2dDbGFzczogRGlhbG9nMSwgb3B0czp0aGlzLnByb3BzLnZpZXdfc3RhdHVzfSk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmlld19vcHRpb25zID0gWydhbGwnLCAnYmFja2xvZycsICdpbiBwcm9jZXNzJywgJ2hvbGQnLCAnY2xvc2VkJ107XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwidG9vbGJveFwifSwgXG4gICAgICAgICAgICAgICAgLyo8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdFwiIHR5cGU9XCJidXR0b25cIiBkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCIgZGF0YS10YXJnZXQ9XCIjYWRkbmV3MlwiPk5ldzwvYnV0dG9uPiovXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiB0aGlzLnNob3dEaWFsb2d9LCBcIk5ld1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChEcm9wZG93bkJ1dHRvbiwge3RpdGxlOiBzdGF0dXNDYXB0aW9uKHRoaXMucHJvcHMudmlld19zdGF0dXMpLCBvblNlbGVjdDogdGhpcy5uZXdTZWxlY3R9LCBcbiAgICAgICAgICAgICAgICAgICAgdmlld19vcHRpb25zLm1hcChmdW5jdGlvbihzdGF0dXMpXG4gICAgICAgICAgICAgICAgICAgICAgICB7cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHtldmVudEtleTogc3RhdHVzLCBrZXk6IHN0YXR1c30sIHN0YXR1c0NhcHRpb24oc3RhdHVzKSk7fSlcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KElucHV0LCB7dHlwZTogXCJ0ZXh0XCIsIHJlZjogXCJzZWFyY2hfdmFsdWVcIiwgbGFiZWw6IFwiU2VhcmNoXCJ9KVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgQXBwZW5kRm9ybSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJBcHBlbmRGb3JtXCIsXG4gICAgbWl4aW5zOiBbU3RvcmFnZU1peGluXSxcbiAgICBoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIHN0YXR1czogdGhpcy5yZWZzLnN0YXR1cy5nZXRET01Ob2RlKCkudmFsdWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5yZWZzLmRlc2NyaXB0aW9uLmdldERPTU5vZGUoKS52YWx1ZVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmVtaXQoJ2l0ZW1fYXBwZW5kJywgZGF0YSk7XG4gICAgICAgIFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5kZXNjcmlwdGlvbikudmFsdWU9Jyc7XG4gICAgICAgIHRoaXMuZW1pdCgnY2xvc2VfZGlhbG9nJyk7XG4gICAgfSxcbiAgICBoYW5kbGVDYW5jZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVtaXQoJ2Nsb3NlX2RpYWxvZycpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2lkOiBcImFkZG5ldzJcIiwgY2xhc3NOYW1lOiBcIl9fY29sbGFwc2VcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0ZXh0YXJlYVwiLCB7cmVmOiBcImRlc2NyaXB0aW9uXCIsIGNvbHM6IFwiNjBcIiwgcm93czogXCIxMFwifSlcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic2VsZWN0XCIsIHtyZWY6IFwic3RhdHVzXCIsIGRlZmF1bHRWYWx1ZTogdGhpcy5wcm9wcy52aWV3X3N0YXR1c30sIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiLCB7dmFsdWU6IFwiaW4gcHJvY2Vzc1wifSwgXCJpbiBwcm9jZXNzXCIpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIiwge3ZhbHVlOiBcImJhY2tsb2dcIn0sIFwiYmFja2xvZ1wiKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIsIHt2YWx1ZTogXCJob2xkXCJ9LCBcImhvbGRcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiLCB7dmFsdWU6IFwiY2xvc2VkXCJ9LCBcImNsb3NlZFwiKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBvbkNsaWNrOiB0aGlzLmhhbmRsZVN1Ym1pdH0sIFwiU3VibWl0XCIpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBvbkNsaWNrOiB0aGlzLmhhbmRsZUNhbmNlbH0sIFwiQ2FuY2VsXCIpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5jb25zdCBUb2RvTGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJUb2RvTGlzdFwiLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IHRoaXMucHJvcHMudG9kb3MubWFwKGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFRvZG9JdGVtLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrOiB0YXNrLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdfc3RhdHVzOiB0aGlzLnByb3BzLnZpZXdfc3RhdHVzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogdGFzay5pZH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgICAgICAgICAgIGl0ZW1zXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG5cbiAgICB9XG59KTtcblxuXG52YXIgVG9kb1BhZ2UgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiVG9kb1BhZ2VcIixcbiAgICBtaXhpbnM6IFtTdG9yYWdlTWl4aW5dLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2aWV3X3N0YXR1czogJ2luIHByb2Nlc3MnLFxuICAgICAgICAgICAgdG9kb3M6IFtdLFxuICAgICAgICAgICAgZGlhbG9nOiBudWxsLFxuICAgICAgICAgICAgcGF0aDogJ2hvbWUnXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnaW5pdGlhbF9sb2FkJyk7XG4gICAgICAgIC8vc3RvcmFnZS5vbigndXBkYXRlJywgdGhpcy5zdG9yYWdlVXBkYXRlZCk7XG4gICAgfSxcbiAgICBzdG9yYWdlVXBkYXRlZDogZnVuY3Rpb24oc3RvcmFnZSkge1xuICAgICAgICBzID0gc3RvcmFnZS5zdGF0ZTtcbiAgICAgICAgbmV3X3N0YXRlID0ge1xuICAgICAgICAgICAgdmlld19zdGF0dXM6IHMuc3RhdHVzLFxuICAgICAgICAgICAgdG9kb3M6IHMudG9kb3MsXG4gICAgICAgICAgICBkaWFsb2c6IHMuZGlhbG9nLFxuICAgICAgICAgICAgcGF0aDogcy5wYXRoXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0U3RhdGUobmV3X3N0YXRlKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaWFsb2c7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRpYWxvZykge1xuICAgICAgICAgICAgdmFyIEQgPSB0aGlzLnN0YXRlLmRpYWxvZy5kaWFsb2dDbGFzcztcbiAgICAgICAgICAgIGRpYWxvZyA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoRCwge29wdHM6IHRoaXMuc3RhdGUuZGlhbG9nLm9wdHN9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpYWxvZyA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhZ2U7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBhdGg9PSdob21lJykge1xuICAgICAgICAgICAgcGFnZSA9IChcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgICAgICAgICAgZGlhbG9nLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KExpbmssIHtwYXRoOiBcInNldHRpbmdzXCJ9LCBcIlNldHRpbmdzXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRvb2xiYXIsIHt2aWV3X3N0YXR1czogdGhpcy5zdGF0ZS52aWV3X3N0YXR1c30pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRvZG9MaXN0LCB7dG9kb3M6IHRoaXMuc3RhdGUudG9kb3MsIHZpZXdfc3RhdHVzOiB0aGlzLnN0YXRlLnZpZXdfc3RhdHVzfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWdlID0gUmVhY3QuY3JlYXRlRWxlbWVudChTZXR0aW5ncywgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhZ2U7XG4gICAgfVxufSk7XG5cbmV4cG9ydHMucmVuZGVyX3Jvb3QgPSBmdW5jdGlvbigpIHtcbiAgICBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChUb2RvUGFnZSwgbnVsbCksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykpO1xufSIsImNvbnN0IHN0cmZ0aW1lID0gcmVxdWlyZSgnc3RyZnRpbWUnKTtcblxuY29uc3QgY29ubl9zdHIgPSAndG9kb19sb2NhbCc7XG5cbmZ1bmN0aW9uIFNlcnZlcihjb25uX3N0ciwgb3B0cykge1xuICAgIHRoaXMuYmFja2VuZCA9IFBvdWNoREIoY29ubl9zdHIsIG9wdHMpO1xufVxuXG5mdW5jdGlvbiBzcnYybG9jYWwodG9kbykge1xuICAgIHRvZG8uaWQ9dG9kby5faWQ7XG4gICAgcmV0dXJuIHRvZG87XG59XG5cbmZ1bmN0aW9uIGZpbmRBbGwocmVnRXgsIHMpIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgcmVnRXgubGFzdEluZGV4PTA7XG4gICAgd2hpbGUgKG09cmVnRXguZXhlYyhzKSkge1xuICAgICAgICByZXMucHVzaChtWzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuY29uc3QgZGF0ZV9mb3JtYXQgPSBcIiVZLSVtLSVkICVIOiVNOiVTLiVMXCI7XG5cbmZ1bmN0aW9uIGVjaG8obXNnKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG1zZywgdmFsdWUpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZXJyb3IobXNnKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnLCB2YWx1ZSk7XG4gICAgfVxufVxuXG5cblxuU2VydmVyLnByb3RvdHlwZSA9IHtcbiAgICBjcmVhdGVfdmlld3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbWFpbiA9IHtcbiAgICAgICAgICAgIF9pZDogJ19kZXNpZ24vbWFpbicsXG4gICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgIGFsbF9ieV9kYXRlX3VwZGF0ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBmdW5jdGlvbihkb2Mpe2VtaXQoZG9jLmRhdGVfdXBkYXRlZCwgbnVsbCk7fS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBieV9zdGF0dXNfZGF0ZV91cGRhdGVkOiB7XG4gICAgICAgICAgICAgICAgICAgIG1hcDogZnVuY3Rpb24oZG9jKXtlbWl0KFtkb2Muc3RhdHVzLGRvYy5kYXRlX3VwZGF0ZWRdLG51bGwpO30udG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYnlfdGFnX3N0YXR1c19kYXRlX3VwZGF0ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBmdW5jdGlvbihkb2Mpe2RvYy50YWdzLmZvckVhY2goZnVuY3Rpb24odGFnKXtlbWl0KFt0YWcsZG9jLnN0YXR1cyxkb2MuZGF0ZV91cGRhdGVkXSxudWxsKTt9KTt9LnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYmFja2VuZC5wdXQobWFpbikudGhlbihmdW5jdGlvbigpe2NvbnNvbGUubG9nKCdvaycpfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtjb25zb2xlLmVycm9yKGVycik7fSk7XG4gICAgfSxcbiAgICBzeW5jOiBmdW5jdGlvbihhcmdzKXtcbiAgICAgICAgdmFyIGJhY2tlbmQgPSB0aGlzLmJhY2tlbmQ7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzX2tleSA9ICdfbG9jYWwvc2V0dGluZ3NfcmVtb3RlJztcbiAgICAgICAgdmFyIHNhdmUgPSBmdW5jdGlvbihkb2MpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBhcmdzLnBhc3N3b3JkO1xuICAgICAgICAgICAgYXJncy5faWQgPSBzZXR0aW5nc19rZXk7XG4gICAgICAgICAgICBhcmdzLmxhc3Rfc3luY19kYXRlID0gc3RyZnRpbWUoZGF0ZV9mb3JtYXQsIG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgaWYgKGRvYykge1xuICAgICAgICAgICAgICAgIGFyZ3MuX3Jldj1kb2MuX3JldlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFja2VuZC5wdXQoYXJncyk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBvbkNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBiYWNrZW5kLmdldChzZXR0aW5nc19rZXkpXG4gICAgICAgICAgICAgICAgLnRoZW4oc2F2ZSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5zdGF0dXM9PTQwNCkge3NhdmUobnVsbCk7fVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgICAgIHZhciByZW1vdGUgPSBuZXcgUG91Y2hEQihhcmdzLnVybCwge2F1dGg6IHt1c2VybmFtZTphcmdzLnVzZXJuYW1lLHBhc3N3b3JkOmFyZ3MucGFzc3dvcmR9fSk7XG4gICAgICAgIHRoaXMuYmFja2VuZC5zeW5jKHJlbW90ZSlcbiAgICAgICAgICAgIC5vbignY29tcGxldGUnLCBvbkNvbXBsZXRlKVxuICAgICAgICAgICAgLm9uKCdlcnJvcicsIGVycm9yKCdlcnJvciBoYW5kbGVyIGNhbGxlZCcpKTtcbiAgICB9LFxuICAgIHNldF9zdGF0dXM6IGZ1bmN0aW9uKHRvZG8sIHN0YXR1cykge1xuICAgICAgICAvL3JldHVybiB0aGlzLnBvc3RfcHJvbWlzZSgnc2V0LXN0YXR1cycsIHtpZDogaWQsIHN0YXR1czogc3RhdHVzfSk7XG4gICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgICBfaWQ6IHRvZG8uaWQsXG4gICAgICAgICAgICBfcmV2OiB0b2RvLl9yZXYsXG4gICAgICAgICAgICBkYXRlX2NyZWF0ZWQ6IHRvZG8uZGF0ZV9jcmVhdGVkLFxuICAgICAgICAgICAgZGF0ZV91cGRhdGVkOiBzdHJmdGltZShkYXRlX2Zvcm1hdCwgbmV3IERhdGUoKSksXG4gICAgICAgICAgICB0YWdzOiB0b2RvLnRhZ3MsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdG9kby5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLmJhY2tlbmQucHV0KG9iaik7XG4gICAgfSxcbiAgICBnZXRfbGlzdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB2YXIgdmlldyA9ICdtYWluL2FsbF9ieV9kYXRlX3VwZGF0ZWQnO1xuICAgICAgICB2YXIgc3RhcnRrZXkgPSB7fTtcbiAgICAgICAgdmFyIGVuZGtleSA9ICcnO1xuICAgICAgICBpZiAob3B0aW9ucy5zdGF0dXMhPSdhbGwnKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zZWFyY2hfdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2aWV3ID0gJ21haW4vYnlfdGFnX3N0YXR1c19kYXRlX3VwZGF0ZWQnO1xuICAgICAgICAgICAgICAgIHN0YXJ0a2V5ID0gW29wdGlvbnMuc2VhcmNoX3ZhbHVlLCBvcHRpb25zLnN0YXR1cywge31dO1xuICAgICAgICAgICAgICAgIGVuZGtleSA9IFtvcHRpb25zLnNlYXJjaF92YWx1ZSwgb3B0aW9ucy5zdGF0dXNdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2aWV3ID0gJ21haW4vYnlfc3RhdHVzX2RhdGVfdXBkYXRlZCc7XG4gICAgICAgICAgICAgICAgc3RhcnRrZXkgPSBbb3B0aW9ucy5zdGF0dXMsIHt9XTtcbiAgICAgICAgICAgICAgICBlbmRrZXkgPSBbb3B0aW9ucy5zdGF0dXNdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuYmFja2VuZC5xdWVyeSh2aWV3LCB7ZGVzY2VuZGluZzogdHJ1ZSwgc3RhcnRrZXk6c3RhcnRrZXksaW5jbHVkZV9kb2NzOnRydWUscmVkdWNlOmZhbHNlLGVuZGtleTplbmRrZXl9KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSl7cmV0dXJuIGRhdGEucm93cy5tYXAoZnVuY3Rpb24ocm93KXtyZXR1cm4gc3J2MmxvY2FsKHJvdy5kb2MpO30pO30pO1xuICAgIH0sXG4gICAgYWRkX3RvZG86IGZ1bmN0aW9uKGZvcm1fZGF0YSkge1xuICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgZm9ybV9kYXRhLmRhdGVfY3JlYXRlZCA9IGZvcm1fZGF0YS5kYXRlX3VwZGF0ZWQgPSBzdHJmdGltZShkYXRlX2Zvcm1hdCwgbm93KTtcbiAgICAgICAgZm9ybV9kYXRhLnRhZ3MgPSBmaW5kQWxsKC8jXFx3Kyg/OlxcLlxcdyspKi9nLCBmb3JtX2RhdGEuZGVzY3JpcHRpb24pO1xuICAgICAgICByZXR1cm4gdGhpcy5iYWNrZW5kLnBvc3QoZm9ybV9kYXRhKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSl7cmV0dXJuIHRoaXMuYmFja2VuZC5nZXQoZGF0YS5pZCk7fS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odG9kbyl7cmV0dXJuIHNydjJsb2NhbCh0b2RvKX0pO1xuICAgIH0sXG4gICAgZGVsZXRlX3Rhc2s6IGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgLy9yZXR1cm4gdGhpcy5wb3N0X3Byb21pc2UoJ2RlbGV0ZV90YXNrJywge2lkOiBpZH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5iYWNrZW5kLnJlbW92ZSh0YXNrKTtcbiAgICB9XG5cbn1cblxuLy9leHBvcnRzLnNydiA9IG5ldyBTZXJ2ZXIoJ2h0dHA6Ly9hZG1pbjphZG1pbkBsb2NhbGhvc3Q6NTk4NC90b2RvJyk7XG5leHBvcnRzLnNydiA9IG5ldyBTZXJ2ZXIoY29ubl9zdHIpO1xuIiwiLy9uZXh0VGljayBpbXBsZW1lbnRhdGlvbiBncmF0ZWZ1bGx5IHN0ZWFsZWQgYXQgXG4vLyBodHRwOi8vdGltbmV3Lm1lL2Jsb2cvMjAxNC8wNi8yMy9wcm9jZXNzLW5leHR0aWNrLWltcGxlbWVudGF0aW9uLWluLWJyb3dzZXIvXG5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5mdW5jdGlvbiBEaXNwYXRjaGVyKCkge1xuXHR0aGlzLmxpc3RlbmVycyA9IHt9O1xufVxuXG5EaXNwYXRjaGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50SWQsIGhhbmRsZXIpIHtcblx0dmFyIGhhbmRsZXJzID0gdGhpcy5saXN0ZW5lcnNbZXZlbnRJZF1cblx0aWYgKCFoYW5kbGVycykge1xuXHRcdHRoaXMubGlzdGVuZXJzW2V2ZW50SWRdID0gaGFuZGxlcnMgPSBbXTtcblx0fVxuXHRoYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xufVxuXG5EaXNwYXRjaGVyLnByb3RvdHlwZS51bmxpc3RlbiA9IGZ1bmN0aW9uKGV2ZW50SWQsIGhhbmRsZXIpIHtcblx0dmFyIGhhbmRsZXJzID0gdGhpcy5saXN0ZW5lcnNbZXZlbnRJZF07XG5cdGlmIChoYW5kbGVycykge1xuXHRcdGhhbmRsZXJzID0gaGFuZGxlcnMuZmlsdGVyKGZ1bmN0aW9uKGgpe3JldHVybiBoIT09aGFuZGxlcn0pO1xuXHRcdGlmIChoYW5kbGVycykge1xuXHRcdFx0dGhpcy5saXN0ZW5lcnNbZXZlbnRJZF0gPSBoYW5kbGVycztcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGVsZXRlIHRoaXMubGlzdGVuZXJzW2V2ZW50SWRdO1xuXHRcdH1cblx0fVxufVxuXG4vLyBjYWwgaGFuZGxlcnMgYWN5bmNocm9ub3VzbHlcbkRpc3BhdGNoZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudElkLCBhcmdzKSB7XG5cdG5leHRUaWNrKGZ1bmN0aW9uKCkge1xuXHRcdHZhciBoYW5kbGVycyA9IHRoaXMubGlzdGVuZXJzW2V2ZW50SWRdO1xuXHRcdGlmIChoYW5kbGVycykge1xuXHRcdFx0aGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbihoKXtoKGFyZ3MpO30pO1xuXHRcdH1cblx0fS5iaW5kKHRoaXMpKTtcbn1cblxuZXhwb3J0cy5EaXNwYXRjaGVyID0gRGlzcGF0Y2hlcjsiLCJcbndpbmRvdy5yZW5kZXJfcm9vdCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpLnJlbmRlcl9yb290O1xuXG53aW5kb3cudG9kb2xpc3QgPSB7XG5cdHNydjogcmVxdWlyZSgnLi9jb3VjaF9zZXJ2ZXInKS5zcnZcbn0iLCJjb25zdCBTdG9yYWdlTWl4aW4gPSByZXF1aXJlKCcuL3RvZG9fc3RvcmFnZScpLkRpc3BhdGNoZXJNaXhpbjtcblxuZXhwb3J0cy5MaW5rID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkxpbmtcIixcbiAgICBtaXhpbnM6IFtTdG9yYWdlTWl4aW5dLFxuICAgIGhhbmRsZUNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdsaW5rJywgdGhpcy5wcm9wcy5wYXRoKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtocmVmOiBcIiNcIiwgb25DbGljazogdGhpcy5oYW5kbGVDbGlja30sIHRoaXMucHJvcHMuY2hpbGRyZW4pXG4gICAgICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4iLCJjb25zdCBTdG9yYWdlTWl4aW4gPSByZXF1aXJlKCcuL3RvZG9fc3RvcmFnZScpLkRpc3BhdGNoZXJNaXhpbjtcbmNvbnN0IExpbmsgPSByZXF1aXJlKCcuL2xpbmsnKS5MaW5rO1xuY29uc3Qgc3J2ID0gcmVxdWlyZSgnLi9jb3VjaF9zZXJ2ZXInKS5zcnY7XG5cbmV4cG9ydHMuU2V0dGluZ3MgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiU2V0dGluZ3NcIixcbiAgICBtaXhpbnM6IFtTdG9yYWdlTWl4aW5dLFxuXHRjcmVhdGVWaWV3czogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmVtaXQoJ2NyZWF0ZV92aWV3cycpO1xuXHR9LFxuXHRzeW5jOiBmdW5jdGlvbigpe1xuXHRcdHZhciBhcmdzID0ge1xuXHRcdFx0dXJsOiBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMucmVwbGljYXRpb25fdXJsKS52YWx1ZSxcblx0XHRcdHVzZXJuYW1lOiBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMudXNlcm5hbWUpLnZhbHVlLFxuXHRcdFx0cGFzc3dvcmQ6IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5wYXNzd29yZCkudmFsdWVcblx0XHR9O1xuXHRcdHRoaXMuZW1pdCgnc3luYycsIGFyZ3MpO1xuXHR9LFxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lbWl0KCdnZXRfc3luY19wYXJhbXMnLCBmdW5jdGlvbihwYXJhbXMpe1xuXHRcdFx0UmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnJlcGxpY2F0aW9uX3VybCkudmFsdWU9cGFyYW1zLnVybDtcblx0XHRcdFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy51c2VybmFtZSkudmFsdWU9cGFyYW1zLnVzZXJuYW1lO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KExpbmssIHtwYXRoOiBcImhvbWVcIn0sIFwiSG9tZVwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImgyXCIsIG51bGwsIFwiU2V0dGluZ3MgcGFnZVwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgICAgICAgICAgICAgICBcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtocmVmOiBcIiNcIiwgb25DbGljazogdGhpcy5jcmVhdGVWaWV3c30sIFwiQ3JlYXRlIHZpZXdzXCIpXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoM1wiLCBudWxsLCBcIlJlcGxpY2F0aW9uXCIpLCBcbiAgICAgICAgICAgIFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcblx0ICAgICAgICAgICAgXHRSZWFjdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwgbnVsbCwgXCJzZXJ2ZXIgdXJsXCIpLCBcblx0ICAgICAgICAgICAgXHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge25hbWU6IFwicmVwbGljYXRpb25fdXJsXCIsIHR5cGU6IFwidGV4dFwiLCByZWY6IFwicmVwbGljYXRpb25fdXJsXCIsIHNpemU6IFwiNDBcIn0pXG5cdCAgICAgICAgICAgICksIFxuXHQgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuXHQgICAgICAgICAgICBcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCBudWxsLCBcInVzZXJuYW1lXCIpLCBcblx0ICAgICAgICAgICAgXHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge25hbWU6IFwidXNlcm5hbWVcIiwgdHlwZTogXCJ0ZXh0XCIsIHJlZjogXCJ1c2VybmFtZVwiLCBkZWZhdWx0VmFsdWU6IFwiYWRtaW5cIiwgc2l6ZTogXCIzMFwifSlcblx0ICAgICAgICAgICAgKSwgXG5cdCAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG5cdCAgICAgICAgICAgIFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImxhYmVsXCIsIG51bGwsIFwicGFzc3dvcmRcIiksIFxuXHQgICAgICAgICAgICBcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7bmFtZTogXCJwYXNzd29yZFwiLCB0eXBlOiBcInBhc3N3b3JkXCIsIHJlZjogXCJwYXNzd29yZFwiLCBzaXplOiBcIjMwXCJ9KVxuXHQgICAgICAgICAgICApLCBcblx0ICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7b25DbGljazogdGhpcy5zeW5jfSwgXCJTeW5jXCIpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG4iLCJcbmZ1bmN0aW9uIFN0b3JhZ2UoKSB7XG5cdHRoaXMuYWN0aW9ucyA9IHt9O1xufVxuXG5TdG9yYWdlLnByb3RvdHlwZS51cGRhdGVfZXZlbnQgPSAndXBkYXRlJztcblxuU3RvcmFnZS5wcm90b3R5cGUubW91bnQgPSBmdW5jdGlvbihkaXNwYXRjaGVyKSB7XG5cdGZvciAodmFyIGFjdGlvbl9pZCBpbiB0aGlzLmFjdGlvbnMpIHtcblx0XHRkaXNwYXRjaGVyLm9uKGFjdGlvbl9pZCwgdGhpcy5hY3Rpb25zW2FjdGlvbl9pZF0pO1xuXHR9XG5cdHRoaXMudXBkYXRlZCA9IGZ1bmN0aW9uKCkge2Rpc3BhdGNoZXIuZW1pdCh0aGlzLnVwZGF0ZV9ldmVudCwgdGhpcyl9O1xufVxuXG5TdG9yYWdlLnByb3RvdHlwZS51bm1vdW50ID0gZnVuY3Rpb24oZGlzcGF0Y2hlcikge1xuXHRmb3IgKHZhciBhY3Rpb25faWQgaW4gdGhpcy5hY3Rpb25zKSB7XG5cdFx0ZGlzcGF0Y2hlci51bmxpc3RlbihhY3Rpb25faWQsIHRoaXMuYWN0aW9uc1thY3Rpb25faWRdKTtcblx0fVxuXHRkZWxldGUgdGhpcy51cGRhdGVkO1xufVxuXG5TdG9yYWdlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50LCBjYWxsYmFjaykge1xuXHR0aGlzLmFjdGlvbnNbZXZlbnRdID0gY2FsbGJhY2suYmluZCh0aGlzKTtcbn1cblxuZXhwb3J0cy5TdG9yYWdlID0gU3RvcmFnZTsiLCJcbi8vIHZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG4vLyB2YXIgYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG4vL3ZhciBzcnYgPSByZXF1aXJlKCcuL3NlcnZlcicpLnNydjtcbnZhciBzcnYgPSByZXF1aXJlKCcuL2NvdWNoX3NlcnZlcicpLnNydjtcbnZhciBTdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlJykuU3RvcmFnZTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9kaXNwYXRjaGVyJykuRGlzcGF0Y2hlcjtcblxuLy9kaXNwYXRjaGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4vL3N0b3JhZ2UgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5zdG9yYWdlID0gbmV3IFN0b3JhZ2UoKTtcblxuc3RvcmFnZS5zdGF0ZSA9IHtcbiAgICBzdGF0dXM6ICdpbiBwcm9jZXNzJyxcbiAgICB0b2RvczogW10sXG4gICAgcGF0aDogJ2hvbWUnXG59O1xuXG5zdG9yYWdlLm9uKCdjcmVhdGVfdmlld3MnLCBmdW5jdGlvbigpe1xuICAgIHNydi5jcmVhdGVfdmlld3MoKTtcbiAgICBjb25zb2xlLmxvZygnb2snKTtcbn0pO1xuXG5zdG9yYWdlLm9uKCdpbml0aWFsX2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICBzcnYuZ2V0X2xpc3Qoe3N0YXR1czogdGhpcy5zdGF0ZS5zdGF0dXMsIHNlYXJjaF92YWx1ZTonJ30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIHRoaXMuc3RhdGUudG9kb3MgPSBkYXRhO1xuICAgICAgICB0aGlzLnN0YXRlLnN0YXR1cyA9IHRoaXMuc3RhdGUuc3RhdHVzO1xuICAgICAgICB0aGlzLnVwZGF0ZWQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xufSk7XG5cbnN0b3JhZ2Uub24oJ3VwZGF0ZV9pdGVtX3N0YXR1cycsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgcHJlZCA9IGZ1bmN0aW9uKHRvZG8pe1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5zdGF0dXM9PSdhbGwnIHx8IGRhdGEubmV3X3N0YXR1cz09dGhpcy5zdGF0ZS5zdGF0dXMgfHwgdG9kby5pZCE9ZGF0YS50YXNrLmlkO1xuICAgIH0uYmluZCh0aGlzKTtcbiAgICBzcnYuc2V0X3N0YXR1cyhkYXRhLnRhc2ssIGRhdGEubmV3X3N0YXR1cykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS50b2RvcyA9IHRoaXMuc3RhdGUudG9kb3MuZmlsdGVyKHByZWQpO1xuICAgICAgICB0aGlzLnVwZGF0ZWQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xufSk7XG5cbnN0b3JhZ2Uub24oJ3ZpZXdfc3RhdHVzX2NoYW5nZWQnLCBmdW5jdGlvbihvcHRpb25zKXtcbiAgICBzcnYuZ2V0X2xpc3Qob3B0aW9ucykudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdGhpcy5zdGF0ZS50b2RvcyA9IGRhdGE7XG4gICAgICAgIHRoaXMuc3RhdGUuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXM7XG4gICAgICAgIHRoaXMudXBkYXRlZCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59KTtcblxuc3RvcmFnZS5vbignaXRlbV9hcHBlbmQnLCAgZnVuY3Rpb24oZGF0YSkge1xuICAgIHNydi5hZGRfdG9kbyhkYXRhKS50aGVuKGZ1bmN0aW9uKGl0ZW1zKXtcbiAgICAgICAgaWYgKGRhdGEuc3RhdHVzPT10aGlzLnN0YXRlLnN0YXR1cyB8fCB0aGlzLnN0YXRlLnN0YXR1cz09J2FsbCcpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUudG9kb3MgPSBbaXRlbXNdLmNvbmNhdCh0aGlzLnN0YXRlLnRvZG9zKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlZCgpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbn0pO1xuXG5zdG9yYWdlLm9uKCdkZWxldGVfaXRlbScsIGZ1bmN0aW9uKHRvZG8pIHtcbiAgICBzcnYuZGVsZXRlX3Rhc2sodG9kbykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS50b2RvcyA9IHRoaXMuc3RhdGUudG9kb3MuZmlsdGVyKGZ1bmN0aW9uKHQyKXtyZXR1cm4gdDIuaWQhPXRvZG8uaWR9KTtcbiAgICAgICAgdGhpcy51cGRhdGVkKCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn0pO1xuXG5zdG9yYWdlLm9uKCdzaG93X2RpYWxvZycsIGZ1bmN0aW9uKG9wdHMpe1xuICAgIHRoaXMuc3RhdGUuZGlhbG9nID0gb3B0cztcbiAgICBjb25zb2xlLmxvZygnc2hvd19kaWFsb2cnLCBvcHRzKTtcbiAgICB0aGlzLnVwZGF0ZWQoKTtcbn0pO1xuXG5zdG9yYWdlLm9uKCdjbG9zZV9kaWFsb2cnLCBmdW5jdGlvbigpe1xuICAgIHRoaXMuc3RhdGUuZGlhbG9nID0gbnVsbDtcbiAgICB0aGlzLnVwZGF0ZWQoKTtcbn0pO1xuXG5zdG9yYWdlLm9uKCdsaW5rJywgZnVuY3Rpb24ocGF0aCl7XG4gICAgdGhpcy5zdGF0ZS5wYXRoPXBhdGg7XG4gICAgdGhpcy51cGRhdGVkKCk7XG59KTtcblxuc3RvcmFnZS5vbignc3luYycsIGZ1bmN0aW9uKGFyZ3Mpe1xuICAgIHNydi5zeW5jKGFyZ3MpO1xuICAgIHRoaXMudXBkYXRlZCgpO1xufSk7XG5cbnN0b3JhZ2Uub24oJ2dldF9zeW5jX3BhcmFtcycsIGZ1bmN0aW9uKGNhbGxiYWNrKXtcbiAgICBzcnYuYmFja2VuZC5nZXQoJ19sb2NhbC9zZXR0aW5nc19yZW1vdGUnKVxuICAgICAgICAudGhlbihjYWxsYmFjayk7XG59KTtcblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuc3RvcmFnZS5tb3VudChkaXNwYXRjaGVyKTtcblxuZXhwb3J0cy5EaXNwYXRjaGVyTWl4aW4gPSB7XG4gICAgZW1pdDogZnVuY3Rpb24oZXZlbnQsIG9wdGlvbnMpIHtcbiAgICAgICAgZGlzcGF0Y2hlci5lbWl0KGV2ZW50LCBvcHRpb25zKTtcbiAgICB9LFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnN0b3JhZ2VVcGRhdGVkKSB7XG4gICAgICAgICAgICBkaXNwYXRjaGVyLm9uKCd1cGRhdGUnLCB0aGlzLnN0b3JhZ2VVcGRhdGVkKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5zdG9yYWdlVXBkYXRlZCkge1xuICAgICAgICAgICAgZGlzcGF0Y2hlci51bmxpc3RlbigndXBkYXRlJywgdGhpcy5zdG9yYWdlVXBkYXRlZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIi8vXG4vLyBzdHJmdGltZVxuLy8gZ2l0aHViLmNvbS9zYW1zb25qcy9zdHJmdGltZVxuLy8gQF9zanNcbi8vXG4vLyBDb3B5cmlnaHQgMjAxMCAtIDIwMTUgU2FtaSBTYW1odXJpIDxzYW1pQHNhbWh1cmkubmV0PlxuLy9cbi8vIE1JVCBMaWNlbnNlXG4vLyBodHRwOi8vc2pzLm1pdC1saWNlbnNlLm9yZ1xuLy9cblxuOyhmdW5jdGlvbigpIHtcblxuICAgIHZhciBEZWZhdWx0TG9jYWxlID0ge1xuICAgICAgICAgICAgZGF5czogWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddLFxuICAgICAgICAgICAgc2hvcnREYXlzOiBbJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddLFxuICAgICAgICAgICAgbW9udGhzOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXSxcbiAgICAgICAgICAgIHNob3J0TW9udGhzOiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ10sXG4gICAgICAgICAgICBBTTogJ0FNJyxcbiAgICAgICAgICAgIFBNOiAnUE0nLFxuICAgICAgICAgICAgYW06ICdhbScsXG4gICAgICAgICAgICBwbTogJ3BtJyxcbiAgICAgICAgICAgIGZvcm1hdHM6IHtcbiAgICAgICAgICAgICAgICBEOiAnJW0vJWQvJXknLFxuICAgICAgICAgICAgICAgIEY6ICclWS0lbS0lZCcsXG4gICAgICAgICAgICAgICAgUjogJyVIOiVNJyxcbiAgICAgICAgICAgICAgICBUOiAnJUg6JU06JVMnLFxuICAgICAgICAgICAgICAgIFg6ICclVCcsXG4gICAgICAgICAgICAgICAgYzogJyVhICViICVkICVYICVZJyxcbiAgICAgICAgICAgICAgICByOiAnJUk6JU06JVMgJXAnLFxuICAgICAgICAgICAgICAgIHY6ICclZS0lYi0lWScsXG4gICAgICAgICAgICAgICAgeDogJyVEJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0U3RyZnRpbWUgPSBuZXcgU3RyZnRpbWUoRGVmYXVsdExvY2FsZSwgMCwgZmFsc2UpLFxuICAgICAgICBpc0NvbW1vbkpTID0gdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcsXG4gICAgICAgIG5hbWVzcGFjZTtcblxuICAgIC8vIENvbW1vbkpTIC8gTm9kZSBtb2R1bGVcbiAgICBpZiAoaXNDb21tb25KUykge1xuICAgICAgICBuYW1lc3BhY2UgPSBtb2R1bGUuZXhwb3J0cyA9IGFkYXB0ZWRTdHJmdGltZTtcbiAgICAgICAgbmFtZXNwYWNlLnN0cmZ0aW1lID0gZGVwcmVjYXRlZFN0cmZ0aW1lO1xuICAgIH1cbiAgICAvLyBCcm93c2VycyBhbmQgb3RoZXIgZW52aXJvbm1lbnRzXG4gICAgZWxzZSB7XG4gICAgICAgIC8vIEdldCB0aGUgZ2xvYmFsIG9iamVjdC4gV29ya3MgaW4gRVMzLCBFUzUsIGFuZCBFUzUgc3RyaWN0IG1vZGUuXG4gICAgICAgIG5hbWVzcGFjZSA9IChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgfHwgKDEsZXZhbCkoJ3RoaXMnKTsgfSgpKTtcbiAgICAgICAgbmFtZXNwYWNlLnN0cmZ0aW1lID0gYWRhcHRlZFN0cmZ0aW1lO1xuICAgIH1cblxuICAgIC8vIERlcHJlY2F0ZWQgQVBJLCB0byBiZSByZW1vdmVkIGluIHYxLjBcbiAgICB2YXIgX3JlcXVpcmUgPSBpc0NvbW1vbkpTID8gXCJyZXF1aXJlKCdzdHJmdGltZScpXCIgOiBcInN0cmZ0aW1lXCI7XG4gICAgdmFyIF9kZXByZWNhdGlvbldhcm5pbmdzID0ge307XG4gICAgZnVuY3Rpb24gZGVwcmVjYXRpb25XYXJuaW5nKG5hbWUsIGluc3RlYWQpIHtcbiAgICAgICAgaWYgKCFfZGVwcmVjYXRpb25XYXJuaW5nc1tuYW1lXSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS53YXJuID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJbV0FSTklOR10gXCIgKyBuYW1lICsgXCIgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMS4wLiBJbnN0ZWFkLCB1c2UgYFwiICsgaW5zdGVhZCArIFwiYC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfZGVwcmVjYXRpb25XYXJuaW5nc1tuYW1lXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuYW1lc3BhY2Uuc3RyZnRpbWVUWiA9IGRlcHJlY2F0ZWRTdHJmdGltZVRaO1xuICAgIG5hbWVzcGFjZS5zdHJmdGltZVVUQyA9IGRlcHJlY2F0ZWRTdHJmdGltZVVUQztcbiAgICBuYW1lc3BhY2UubG9jYWxpemVkU3RyZnRpbWUgPSBkZXByZWNhdGVkU3RyZnRpbWVMb2NhbGl6ZWQ7XG5cbiAgICAvLyBBZGFwdCB0aGUgb2xkIEFQSSB3aGlsZSBwcmVzZXJ2aW5nIHRoZSBuZXcgQVBJLlxuICAgIGZ1bmN0aW9uIGFkYXB0Rm9yd2FyZHMoZm4pIHtcbiAgICAgICAgZm4ubG9jYWxpemUgPSBkZWZhdWx0U3RyZnRpbWUubG9jYWxpemUuYmluZChkZWZhdWx0U3RyZnRpbWUpO1xuICAgICAgICBmbi50aW1lem9uZSA9IGRlZmF1bHRTdHJmdGltZS50aW1lem9uZS5iaW5kKGRlZmF1bHRTdHJmdGltZSk7XG4gICAgICAgIGZuLnV0YyA9IGRlZmF1bHRTdHJmdGltZS51dGMuYmluZChkZWZhdWx0U3RyZnRpbWUpO1xuICAgIH1cblxuICAgIGFkYXB0Rm9yd2FyZHMoYWRhcHRlZFN0cmZ0aW1lKTtcbiAgICBmdW5jdGlvbiBhZGFwdGVkU3RyZnRpbWUoZm10LCBkLCBsb2NhbGUpIHtcbiAgICAgICAgLy8gZCBhbmQgbG9jYWxlIGFyZSBvcHRpb25hbCwgY2hlY2sgaWYgdGhpcyBpcyAoZm9ybWF0LCBsb2NhbGUpXG4gICAgICAgIGlmIChkICYmIGQuZGF5cykge1xuICAgICAgICAgICAgbG9jYWxlID0gZDtcbiAgICAgICAgICAgIGQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvY2FsZSkge1xuICAgICAgICAgICAgZGVwcmVjYXRpb25XYXJuaW5nKFwiYFwiICsgX3JlcXVpcmUgKyBcIihmb3JtYXQsIFtkYXRlXSwgW2xvY2FsZV0pYFwiLCBcInZhciBzID0gXCIgKyBfcmVxdWlyZSArIFwiLmxvY2FsaXplKGxvY2FsZSk7IHMoZm9ybWF0LCBbZGF0ZV0pXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdHJmdGltZSA9IGxvY2FsZSA/IGRlZmF1bHRTdHJmdGltZS5sb2NhbGl6ZShsb2NhbGUpIDogZGVmYXVsdFN0cmZ0aW1lO1xuICAgICAgICByZXR1cm4gc3RyZnRpbWUoZm10LCBkKTtcbiAgICB9XG5cbiAgICBhZGFwdEZvcndhcmRzKGRlcHJlY2F0ZWRTdHJmdGltZSk7XG4gICAgZnVuY3Rpb24gZGVwcmVjYXRlZFN0cmZ0aW1lKGZtdCwgZCwgbG9jYWxlKSB7XG4gICAgICAgIGlmIChsb2NhbGUpIHtcbiAgICAgICAgICAgIGRlcHJlY2F0aW9uV2FybmluZyhcImBcIiArIF9yZXF1aXJlICsgXCIuc3RyZnRpbWUoZm9ybWF0LCBbZGF0ZV0sIFtsb2NhbGVdKWBcIiwgXCJ2YXIgcyA9IFwiICsgX3JlcXVpcmUgKyBcIi5sb2NhbGl6ZShsb2NhbGUpOyBzKGZvcm1hdCwgW2RhdGVdKVwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlcHJlY2F0aW9uV2FybmluZyhcImBcIiArIF9yZXF1aXJlICsgXCIuc3RyZnRpbWUoZm9ybWF0LCBbZGF0ZV0pYFwiLCBfcmVxdWlyZSArIFwiKGZvcm1hdCwgW2RhdGVdKVwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RyZnRpbWUgPSBsb2NhbGUgPyBkZWZhdWx0U3RyZnRpbWUubG9jYWxpemUobG9jYWxlKSA6IGRlZmF1bHRTdHJmdGltZTtcbiAgICAgICAgcmV0dXJuIHN0cmZ0aW1lKGZtdCwgZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVwcmVjYXRlZFN0cmZ0aW1lVFooZm10LCBkLCBsb2NhbGUsIHRpbWV6b25lKSB7XG4gICAgICAgIC8vIGxvY2FsZSBpcyBvcHRpb25hbCwgY2hlY2sgaWYgdGhpcyBpcyAoZm9ybWF0LCBkYXRlLCB0aW1lem9uZSlcbiAgICAgICAgaWYgKCh0eXBlb2YgbG9jYWxlID09ICdudW1iZXInIHx8IHR5cGVvZiBsb2NhbGUgPT0gJ3N0cmluZycpICYmIHRpbWV6b25lID09IG51bGwpIHtcbiAgICAgICAgICAgIHRpbWV6b25lID0gbG9jYWxlO1xuICAgICAgICAgICAgbG9jYWxlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxvY2FsZSkge1xuICAgICAgICAgICAgZGVwcmVjYXRpb25XYXJuaW5nKFwiYFwiICsgX3JlcXVpcmUgKyBcIi5zdHJmdGltZVRaKGZvcm1hdCwgZGF0ZSwgbG9jYWxlLCB0eilgXCIsIFwidmFyIHMgPSBcIiArIF9yZXF1aXJlICsgXCIubG9jYWxpemUobG9jYWxlKS50aW1lem9uZSh0eik7IHMoZm9ybWF0LCBbZGF0ZV0pYCBvciBgdmFyIHMgPSBcIiArIF9yZXF1aXJlICsgXCIubG9jYWxpemUobG9jYWxlKTsgcy50aW1lem9uZSh0eikoZm9ybWF0LCBbZGF0ZV0pXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVwcmVjYXRpb25XYXJuaW5nKFwiYFwiICsgX3JlcXVpcmUgKyBcIi5zdHJmdGltZVRaKGZvcm1hdCwgZGF0ZSwgdHopYFwiLCBcInZhciBzID0gXCIgKyBfcmVxdWlyZSArIFwiLnRpbWV6b25lKHR6KTsgcyhmb3JtYXQsIFtkYXRlXSlgIG9yIGBcIiArIF9yZXF1aXJlICsgXCIudGltZXpvbmUodHopKGZvcm1hdCwgW2RhdGVdKVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdHJmdGltZSA9IChsb2NhbGUgPyBkZWZhdWx0U3RyZnRpbWUubG9jYWxpemUobG9jYWxlKSA6IGRlZmF1bHRTdHJmdGltZSkudGltZXpvbmUodGltZXpvbmUpO1xuICAgICAgICByZXR1cm4gc3RyZnRpbWUoZm10LCBkKTtcbiAgICB9XG5cbiAgICB2YXIgdXRjU3RyZnRpbWUgPSBkZWZhdWx0U3RyZnRpbWUudXRjKCk7XG4gICAgZnVuY3Rpb24gZGVwcmVjYXRlZFN0cmZ0aW1lVVRDKGZtdCwgZCwgbG9jYWxlKSB7XG4gICAgICAgIGlmIChsb2NhbGUpIHtcbiAgICAgICAgICAgIGRlcHJlY2F0aW9uV2FybmluZyhcImBcIiArIF9yZXF1aXJlICsgXCIuc3RyZnRpbWVVVEMoZm9ybWF0LCBkYXRlLCBsb2NhbGUpYFwiLCBcInZhciBzID0gXCIgKyBfcmVxdWlyZSArIFwiLmxvY2FsaXplKGxvY2FsZSkudXRjKCk7IHMoZm9ybWF0LCBbZGF0ZV0pXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVwcmVjYXRpb25XYXJuaW5nKFwiYFwiICsgX3JlcXVpcmUgKyBcIi5zdHJmdGltZVVUQyhmb3JtYXQsIFtkYXRlXSlgXCIsIFwidmFyIHMgPSBcIiArIF9yZXF1aXJlICsgXCIudXRjKCk7IHMoZm9ybWF0LCBbZGF0ZV0pXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdHJmdGltZSA9IGxvY2FsZSA/IHV0Y1N0cmZ0aW1lLmxvY2FsaXplKGxvY2FsZSkgOiB1dGNTdHJmdGltZTtcbiAgICAgICAgcmV0dXJuIHN0cmZ0aW1lKGZtdCwgZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVwcmVjYXRlZFN0cmZ0aW1lTG9jYWxpemVkKGxvY2FsZSkge1xuICAgICAgICBkZXByZWNhdGlvbldhcm5pbmcoXCJgXCIgKyBfcmVxdWlyZSArIFwiLmxvY2FsaXplZFN0cmZ0aW1lKGxvY2FsZSlgXCIsIF9yZXF1aXJlICsgXCIubG9jYWxpemUobG9jYWxlKVwiKTtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRTdHJmdGltZS5sb2NhbGl6ZShsb2NhbGUpO1xuICAgIH1cbiAgICAvLyBFbmQgb2YgZGVwcmVjYXRlZCBBUElcblxuICAgIC8vIFBvbHlmaWxsIERhdGUubm93IGZvciBvbGQgYnJvd3NlcnMuXG4gICAgaWYgKHR5cGVvZiBEYXRlLm5vdyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiArbmV3IERhdGUoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBTdHJmdGltZShsb2NhbGUsIGN1c3RvbVRpbWV6b25lT2Zmc2V0LCB1c2VVdGNUaW1lem9uZSkge1xuICAgICAgICB2YXIgX2xvY2FsZSA9IGxvY2FsZSB8fCBEZWZhdWx0TG9jYWxlLFxuICAgICAgICAgICAgX2N1c3RvbVRpbWV6b25lT2Zmc2V0ID0gY3VzdG9tVGltZXpvbmVPZmZzZXQgfHwgMCxcbiAgICAgICAgICAgIF91c2VVdGNCYXNlZERhdGUgPSB1c2VVdGNUaW1lem9uZSB8fCBmYWxzZSxcblxuICAgICAgICAgICAgLy8gd2Ugc3RvcmUgdW5peCB0aW1lc3RhbXAgdmFsdWUgaGVyZSB0byBub3QgY3JlYXRlIG5ldyBEYXRlKCkgZWFjaCBpdGVyYXRpb24gKGVhY2ggbWlsbGlzZWNvbmQpXG4gICAgICAgICAgICAvLyBEYXRlLm5vdygpIGlzIDIgdGltZXMgZmFzdGVyIHRoYW4gbmV3IERhdGUoKVxuICAgICAgICAgICAgLy8gd2hpbGUgbWlsbGlzZWNvbmQgcHJlY2lzZSBpcyBlbm91Z2ggaGVyZVxuICAgICAgICAgICAgLy8gdGhpcyBjb3VsZCBiZSB2ZXJ5IGhlbHBmdWwgd2hlbiBzdHJmdGltZSB0cmlnZ2VyZWQgYSBsb3Qgb2YgdGltZXMgb25lIGJ5IG9uZVxuICAgICAgICAgICAgX2NhY2hlZERhdGVUaW1lc3RhbXAgPSAwLFxuICAgICAgICAgICAgX2NhY2hlZERhdGU7XG5cbiAgICAgICAgZnVuY3Rpb24gX3N0cmZ0aW1lKGZvcm1hdCwgZGF0ZSkge1xuICAgICAgICAgICAgdmFyIHRpbWVzdGFtcDtcblxuICAgICAgICAgICAgaWYgKCFkYXRlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRUaW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VGltZXN0YW1wID4gX2NhY2hlZERhdGVUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICAgICAgX2NhY2hlZERhdGVUaW1lc3RhbXAgPSBjdXJyZW50VGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgICBfY2FjaGVkRGF0ZSA9IG5ldyBEYXRlKF9jYWNoZWREYXRlVGltZXN0YW1wKTtcblxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXAgPSBfY2FjaGVkRGF0ZVRpbWVzdGFtcDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX3VzZVV0Y0Jhc2VkRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaG93IHRvIGF2b2lkIGR1cGxpY2F0aW9uIG9mIGRhdGUgaW5zdGFudGlhdGlvbiBmb3IgdXRjIGhlcmU/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSB0aWVkIHRvIGdldFRpbWV6b25lT2Zmc2V0IG9mIHRoZSBjdXJyZW50IGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jYWNoZWREYXRlID0gbmV3IERhdGUoX2NhY2hlZERhdGVUaW1lc3RhbXAgKyBnZXRUaW1lc3RhbXBUb1V0Y09mZnNldEZvcihfY2FjaGVkRGF0ZSkgKyBfY3VzdG9tVGltZXpvbmVPZmZzZXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGltZXN0YW1wID0gX2NhY2hlZERhdGVUaW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGUgPSBfY2FjaGVkRGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcCA9IGRhdGUuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF91c2VVdGNCYXNlZERhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpICsgZ2V0VGltZXN0YW1wVG9VdGNPZmZzZXRGb3IoZGF0ZSkgKyBfY3VzdG9tVGltZXpvbmVPZmZzZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9wcm9jZXNzRm9ybWF0KGZvcm1hdCwgZGF0ZSwgX2xvY2FsZSwgdGltZXN0YW1wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9wcm9jZXNzRm9ybWF0KGZvcm1hdCwgZGF0ZSwgbG9jYWxlLCB0aW1lc3RhbXApIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRTdHJpbmcgPSAnJyxcbiAgICAgICAgICAgICAgICBwYWRkaW5nID0gbnVsbCxcbiAgICAgICAgICAgICAgICBpc0luU2NvcGUgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBmb3JtYXQubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGV4dGVuZGVkVFogPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDaGFyQ29kZSA9IGZvcm1hdC5jaGFyQ29kZUF0KGkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzSW5TY29wZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyAnLSdcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRDaGFyQ29kZSA9PT0gNDUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmcgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vICdfJ1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjdXJyZW50Q2hhckNvZGUgPT09IDk1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nID0gJyAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gJzAnXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGN1cnJlbnRDaGFyQ29kZSA9PT0gNDgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmcgPSAnMCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyAnOidcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY3VycmVudENoYXJDb2RlID09PSA1OCkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRlbmRlZFRaKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLndhcm4gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJbV0FSTklOR10gZGV0ZWN0ZWQgdXNlIG9mIHVuc3VwcG9ydGVkICU6OiBvciAlOjo6IG1vZGlmaWVycyB0byBzdHJmdGltZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kZWRUWiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGN1cnJlbnRDaGFyQ29kZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFeGFtcGxlcyBmb3IgbmV3IERhdGUoMCkgaW4gR01UXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICdUaHVyc2RheSdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ0EnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA2NTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gbG9jYWxlLmRheXNbZGF0ZS5nZXREYXkoKV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICdKYW51YXJ5J1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnQic6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY2OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBsb2NhbGUubW9udGhzW2RhdGUuZ2V0TW9udGgoKV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcxOSdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ0MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA2NzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gcGFkVGlsbDIoTWF0aC5mbG9vcihkYXRlLmdldEZ1bGxZZWFyKCkgLyAxMDApLCBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzAxLzAxLzcwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnRCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY4OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBfcHJvY2Vzc0Zvcm1hdChsb2NhbGUuZm9ybWF0cy5ELCBkYXRlLCBsb2NhbGUsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcxOTcwLTAxLTAxJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnRic6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDcwOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBfcHJvY2Vzc0Zvcm1hdChsb2NhbGUuZm9ybWF0cy5GLCBkYXRlLCBsb2NhbGUsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ0gnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA3MjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gcGFkVGlsbDIoZGF0ZS5nZXRIb3VycygpLCBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzEyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnSSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDczOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihob3VyczEyKGRhdGUuZ2V0SG91cnMoKSksIHBhZGRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnTCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDc2OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMyhNYXRoLmZsb29yKHRpbWVzdGFtcCAlIDEwMDApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnTSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDc3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihkYXRlLmdldE1pbnV0ZXMoKSwgcGFkZGluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICdhbSdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ1AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA4MDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gZGF0ZS5nZXRIb3VycygpIDwgMTIgPyBsb2NhbGUuYW0gOiBsb2NhbGUucG07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcwMDowMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ1InOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA4MjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gX3Byb2Nlc3NGb3JtYXQobG9jYWxlLmZvcm1hdHMuUiwgZGF0ZSwgbG9jYWxlLCB0aW1lc3RhbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdTJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgODM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9IHBhZFRpbGwyKGRhdGUuZ2V0U2Vjb25kcygpLCBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzAwOjAwOjAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnVCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDg0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBfcHJvY2Vzc0Zvcm1hdChsb2NhbGUuZm9ybWF0cy5ULCBkYXRlLCBsb2NhbGUsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ1UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA4NTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gcGFkVGlsbDIod2Vla051bWJlcihkYXRlLCAnc3VuZGF5JyksIHBhZGRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdXJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgODc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9IHBhZFRpbGwyKHdlZWtOdW1iZXIoZGF0ZSwgJ21vbmRheScpLCBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzE2OjAwOjAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnWCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDg4OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBfcHJvY2Vzc0Zvcm1hdChsb2NhbGUuZm9ybWF0cy5YLCBkYXRlLCBsb2NhbGUsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcxOTcwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnWSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDg5OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICdHTVQnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdaJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgOTA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF91c2VVdGNCYXNlZERhdGUgJiYgX2N1c3RvbVRpbWV6b25lT2Zmc2V0ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBcIkdNVFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZml4bWUgb3B0aW1pemVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHR6U3RyaW5nID0gZGF0ZS50b1N0cmluZygpLm1hdGNoKC9cXCgoW1xcd1xcc10rKVxcKS8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gdHpTdHJpbmcgJiYgdHpTdHJpbmdbMV0gfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnVGh1J1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDk3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBsb2NhbGUuc2hvcnREYXlzW2RhdGUuZ2V0RGF5KCldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnSmFuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnYic6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDk4OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBsb2NhbGUuc2hvcnRNb250aHNbZGF0ZS5nZXRNb250aCgpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJydcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ2MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA5OTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gX3Byb2Nlc3NGb3JtYXQobG9jYWxlLmZvcm1hdHMuYywgZGF0ZSwgbG9jYWxlLCB0aW1lc3RhbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDEnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihkYXRlLmdldERhdGUoKSwgcGFkZGluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcgMSdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMDE6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9IHBhZFRpbGwyKGRhdGUuZ2V0RGF0ZSgpLCBwYWRkaW5nID09IG51bGwgPyAnICcgOiBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJ0phbidcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9IGxvY2FsZS5zaG9ydE1vbnRoc1tkYXRlLmdldE1vbnRoKCldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnaic6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEwNjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgeSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRheSA9IE1hdGguY2VpbCgoZGF0ZS5nZXRUaW1lKCkgLSB5LmdldFRpbWUoKSkgLyAoMTAwMCAqIDYwICogNjAgKiAyNCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMyhkYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnIDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdrJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTA3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihkYXRlLmdldEhvdXJzKCksIHBhZGRpbmcgPT0gbnVsbCA/ICcgJyA6IHBhZGRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMTInXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdsJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTA4OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihob3VyczEyKGRhdGUuZ2V0SG91cnMoKSksIHBhZGRpbmcgPT0gbnVsbCA/ICcgJyA6IHBhZGRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDEnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTA5OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihkYXRlLmdldE1vbnRoKCkgKyAxLCBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJ1xcbidcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ24nOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMTA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9ICdcXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMXN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnbyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDExMTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKSArIG9yZGluYWwoZGF0ZS5nZXREYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnQU0nXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTEyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBkYXRlLmdldEhvdXJzKCkgPCAxMiA/IGxvY2FsZS5BTSA6IGxvY2FsZS5QTTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzEyOjAwOjAwIEFNJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAncic6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDExNDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gX3Byb2Nlc3NGb3JtYXQobG9jYWxlLmZvcm1hdHMuciwgZGF0ZSwgbG9jYWxlLCB0aW1lc3RhbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMTU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9IE1hdGguZmxvb3IodGltZXN0YW1wIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICdcXHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICd0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTE2OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSAnXFx0JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzQnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICd1JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTE3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXkgPSBkYXRlLmdldERheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBkYXkgPT09IDAgPyA3IDogZGF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrOyAvLyAxIC0gNywgTW9uZGF5IGlzIGZpcnN0IGRheSBvZiB0aGUgd2Vla1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnIDEtSmFuLTE5NzAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICd2JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTE4OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBfcHJvY2Vzc0Zvcm1hdChsb2NhbGUuZm9ybWF0cy52LCBkYXRlLCBsb2NhbGUsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICc0J1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAndyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDExOTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gZGF0ZS5nZXREYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhazsgLy8gMCAtIDYsIFN1bmRheSBpcyBmaXJzdCBkYXkgb2YgdGhlIHdlZWtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzEyLzMxLzY5J1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAneCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEyMDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gX3Byb2Nlc3NGb3JtYXQobG9jYWxlLmZvcm1hdHMueCwgZGF0ZSwgbG9jYWxlLCB0aW1lc3RhbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnNzAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICd5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTIxOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSAoJycgKyBkYXRlLmdldEZ1bGxZZWFyKCkpLnNsaWNlKDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnKzAwMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICd6JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTIyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfdXNlVXRjQmFzZWREYXRlICYmIF9jdXN0b21UaW1lem9uZU9mZnNldCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gZXh0ZW5kZWRUWiA/IFwiKzAwOjAwXCIgOiBcIiswMDAwXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2ZmO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2N1c3RvbVRpbWV6b25lT2Zmc2V0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmYgPSBfY3VzdG9tVGltZXpvbmVPZmZzZXQgLyAoNjAgKiAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZiA9IC1kYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNpZ24gPSBvZmYgPCAwID8gJy0nIDogJysnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VwID0gZXh0ZW5kZWRUWiA/ICc6JyA6ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZiAvIDYwKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaW5zID0gTWF0aC5hYnMob2ZmICUgNjApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gc2lnbiArIHBhZFRpbGwyKGhvdXJzKSArIHNlcCArIHBhZFRpbGwyKG1pbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gZm9ybWF0W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlzSW5TY29wZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyAnJSdcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudENoYXJDb2RlID09PSAzNykge1xuICAgICAgICAgICAgICAgICAgICBpc0luU2NvcGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gZm9ybWF0W2ldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0U3RyaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0cmZ0aW1lID0gX3N0cmZ0aW1lO1xuXG4gICAgICAgIHN0cmZ0aW1lLmxvY2FsaXplID0gZnVuY3Rpb24obG9jYWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFN0cmZ0aW1lKGxvY2FsZSB8fCBfbG9jYWxlLCBfY3VzdG9tVGltZXpvbmVPZmZzZXQsIF91c2VVdGNCYXNlZERhdGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHN0cmZ0aW1lLnRpbWV6b25lID0gZnVuY3Rpb24odGltZXpvbmUpIHtcbiAgICAgICAgICAgIHZhciBjdXN0b21UaW1lem9uZU9mZnNldCA9IF9jdXN0b21UaW1lem9uZU9mZnNldDtcbiAgICAgICAgICAgIHZhciB1c2VVdGNCYXNlZERhdGUgPSBfdXNlVXRjQmFzZWREYXRlO1xuXG4gICAgICAgICAgICB2YXIgdGltZXpvbmVUeXBlID0gdHlwZW9mIHRpbWV6b25lO1xuICAgICAgICAgICAgaWYgKHRpbWV6b25lVHlwZSA9PT0gJ251bWJlcicgfHwgdGltZXpvbmVUeXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHVzZVV0Y0Jhc2VkRGF0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAvLyBJU08gODYwMSBmb3JtYXQgdGltZXpvbmUgc3RyaW5nLCBbLStdSEhNTVxuICAgICAgICAgICAgICAgIGlmICh0aW1lem9uZVR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzaWduID0gdGltZXpvbmVbMF0gPT09ICctJyA/IC0xIDogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdXJzID0gcGFyc2VJbnQodGltZXpvbmUuc2xpY2UoMSwgMyksIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZXMgPSBwYXJzZUludCh0aW1lem9uZS5zbGljZSgzLCA1KSwgMTApO1xuXG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbVRpbWV6b25lT2Zmc2V0ID0gc2lnbiAqICgoNjAgKiBob3VycykgKyBtaW51dGVzKSAqIDYwICogMTAwMDtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW4gbWludXRlczogNDIwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRpbWV6b25lVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tVGltZXpvbmVPZmZzZXQgPSB0aW1lem9uZSAqIDYwICogMTAwMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgU3RyZnRpbWUoX2xvY2FsZSwgY3VzdG9tVGltZXpvbmVPZmZzZXQsIHVzZVV0Y0Jhc2VkRGF0ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RyZnRpbWUudXRjID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFN0cmZ0aW1lKF9sb2NhbGUsIF9jdXN0b21UaW1lem9uZU9mZnNldCwgdHJ1ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHN0cmZ0aW1lO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhZFRpbGwyKG51bWJlclRvUGFkLCBwYWRkaW5nQ2hhcikge1xuICAgICAgICBpZiAocGFkZGluZ0NoYXIgPT09ICcnIHx8IG51bWJlclRvUGFkID4gOSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlclRvUGFkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYWRkaW5nQ2hhciA9PSBudWxsKSB7XG4gICAgICAgICAgICBwYWRkaW5nQ2hhciA9ICcwJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFkZGluZ0NoYXIgKyBudW1iZXJUb1BhZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYWRUaWxsMyhudW1iZXJUb1BhZCkge1xuICAgICAgICBpZiAobnVtYmVyVG9QYWQgPiA5OSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlclRvUGFkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1iZXJUb1BhZCA+IDkpIHtcbiAgICAgICAgICAgIHJldHVybiAnMCcgKyBudW1iZXJUb1BhZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJzAwJyArIG51bWJlclRvUGFkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhvdXJzMTIoaG91cikge1xuICAgICAgICBpZiAoaG91ciA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDEyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGhvdXIgPiAxMikge1xuICAgICAgICAgICAgcmV0dXJuIGhvdXIgLSAxMjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaG91cjtcbiAgICB9XG5cbiAgICAvLyBmaXJzdFdlZWtkYXk6ICdzdW5kYXknIG9yICdtb25kYXknLCBkZWZhdWx0IGlzICdzdW5kYXknXG4gICAgLy9cbiAgICAvLyBQaWxmZXJlZCAmIHBvcnRlZCBmcm9tIFJ1YnkncyBzdHJmdGltZSBpbXBsZW1lbnRhdGlvbi5cbiAgICBmdW5jdGlvbiB3ZWVrTnVtYmVyKGRhdGUsIGZpcnN0V2Vla2RheSkge1xuICAgICAgICBmaXJzdFdlZWtkYXkgPSBmaXJzdFdlZWtkYXkgfHwgJ3N1bmRheSc7XG5cbiAgICAgICAgLy8gVGhpcyB3b3JrcyBieSBzaGlmdGluZyB0aGUgd2Vla2RheSBiYWNrIGJ5IG9uZSBkYXkgaWYgd2VcbiAgICAgICAgLy8gYXJlIHRyZWF0aW5nIE1vbmRheSBhcyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrLlxuICAgICAgICB2YXIgd2Vla2RheSA9IGRhdGUuZ2V0RGF5KCk7XG4gICAgICAgIGlmIChmaXJzdFdlZWtkYXkgPT09ICdtb25kYXknKSB7XG4gICAgICAgICAgICBpZiAod2Vla2RheSA9PT0gMCkgLy8gU3VuZGF5XG4gICAgICAgICAgICAgICAgd2Vla2RheSA9IDY7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgd2Vla2RheS0tO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpcnN0RGF5T2ZZZWFyVXRjID0gRGF0ZS5VVEMoZGF0ZS5nZXRGdWxsWWVhcigpLCAwLCAxKSxcbiAgICAgICAgICAgIGRhdGVVdGMgPSBEYXRlLlVUQyhkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCkpLFxuICAgICAgICAgICAgeWRheSA9IE1hdGguZmxvb3IoKGRhdGVVdGMgLSBmaXJzdERheU9mWWVhclV0YykgLyA4NjQwMDAwMCksXG4gICAgICAgICAgICB3ZWVrTnVtID0gKHlkYXkgKyA3IC0gd2Vla2RheSkgLyA3O1xuXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHdlZWtOdW0pO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgb3JkaW5hbCBzdWZmaXggZm9yIGEgbnVtYmVyOiBzdCwgbmQsIHJkLCBvciB0aFxuICAgIGZ1bmN0aW9uIG9yZGluYWwobnVtYmVyKSB7XG4gICAgICAgIHZhciBpID0gbnVtYmVyICUgMTA7XG4gICAgICAgIHZhciBpaSA9IG51bWJlciAlIDEwMDtcblxuICAgICAgICBpZiAoKGlpID49IDExICYmIGlpIDw9IDEzKSB8fCBpID09PSAwIHx8IGkgPj0gNCkge1xuICAgICAgICAgICAgcmV0dXJuICd0aCc7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChpKSB7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiAnc3QnO1xuICAgICAgICAgICAgY2FzZSAyOiByZXR1cm4gJ25kJztcbiAgICAgICAgICAgIGNhc2UgMzogcmV0dXJuICdyZCc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUaW1lc3RhbXBUb1V0Y09mZnNldEZvcihkYXRlKSB7XG4gICAgICAgIHJldHVybiAoZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpIHx8IDApICogNjAwMDA7XG4gICAgfVxuXG59KCkpO1xuIl19
