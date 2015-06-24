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
    handleSelect: function(event) {
        this.emit('item_selected', {id:this.props.task.id, checked:event.target.checked});
    },
    render: function() {
        return (
            React.createElement("div", {className: "task"}, 
                React.createElement("div", {className: "description"}, 
                    React.createElement("input", {type: "checkbox", onChange: this.handleSelect}), " ", 
                    this.props.task.description
                ), 
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
        this.emit('view_status_changed', {status: status, search_value: React.findDOMNode(this.refs.search_value).value.trim()});
    },
    showDialog: function(event) {
        //document.getElementById('d1').style.display='block';
        this.emit('show_dialog', {dialogClass: Dialog1, opts:this.props.view_status});
    },
    deleteSelected: function() {
        this.emit('delete_selected');
    },
    updateSelected: function(status) {
        this.emit('update_selected', status);
    },
    updateClick: function() {
        this.emit('update_selected', this.props.view_status==='in process'?'closed':'in process');
    },
    render: function() {
        var view_options = ['all', 'backlog', 'in process', 'hold', 'closed'];
        var next_status = this.props.view_status=='in process'?'closed':'in process';
        var selection_empty = Object.keys(this.props.selection).length===0;
        return (
            React.createElement("div", {className: "toolbox"}, 
                /*<button className="btn btn-default" type="button" data-toggle="collapse" data-target="#addnew2">New</button>*/
                React.createElement("button", {className: "btn btn-default", type: "button", onClick: this.showDialog}, "New"), 
                React.createElement(DropdownButton, {title: statusCaption(this.props.view_status), onSelect: this.newSelect}, 
                    view_options.map(function(status)
                        {return React.createElement(MenuItem, {eventKey: status, key: status}, statusCaption(status));})
                ), 
                React.createElement("span", null, " | "), 
                React.createElement(SplitButton, {title: statusCaption(next_status), disabled: selection_empty, onClick: this.updateClick, onSelect: this.updateSelected}, 
                    view_options.filter(function(opt){return opt!=='all';}).map(function(status)
                        {return React.createElement(MenuItem, {eventKey: status, key: status}, statusCaption(status));})
                ), 
                React.createElement("button", {className: "btn btn-default", type: "button", disabled: selection_empty, onClick: this.deleteSelected}, "Delete selected"), 
                React.createElement("input", {type: "text", ref: "search_value", label: "Search"})
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
            status: 'in process',
            todos: [],
            dialog: null,
            path: 'home',
            select_list:{}
        };
    },
    componentDidMount: function() {
        this.emit('initial_load');
        //storage.on('update', this.storageUpdated);
    },
    storageUpdated: function(storage) {
        this.setState(_.assign({},storage.state));
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
                React.createElement(Toolbar, {view_status: this.state.status, selection: this.state.select_list}), 
                React.createElement(TodoList, {todos: this.state.todos, view_status: this.state.status})
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
const util = require('./util');
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
            args.last_sync_date = strftime(util.date_format, new Date());
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
            date_updated: strftime(util.date_format, new Date()),
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
        form_data.date_created = form_data.date_updated = strftime(util.date_format, now);
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

},{"./util":9,"strftime":10}],3:[function(require,module,exports){
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
const util = require('./util');
const strftime = require('strftime');

//dispatcher = new EventEmitter();

//storage = new EventEmitter();
storage = new Storage();

storage.state = {
    status: 'in process',
    todos: [],
    path: 'home',
    select_list: {}
};

storage.on('create_views', function(){
    srv.create_views();
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
        this.select_list = {};
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

storage.on('item_selected', function(args){
    var select_list=this.state.select_list;
    if (args.checked) {
        select_list[args.id] = 1;
    } else if (args.id in select_list) {
        delete select_list[args.id]
    }
    this.updated();
});

storage.on('delete_selected', function(){
    var selected = this.state.select_list || {};
    var items_to_delete = this.state.todos.filter(function(todo){return todo.id in selected;});
    this.state.todos = this.state.todos.filter(function(todo){return !(todo.id in selected);});
    this.state.select_list={};
    items_to_delete.forEach(function(todo){return todo._deleted=true;});
    srv.backend.bulkDocs(items_to_delete)
        .then(function(){return this.updated();}.bind(this));
});

function setOf(arr) {
    var res = {};
    arr.forEach(function(key){return res[key]=1;});
    return res;
}

storage.on('update_selected', function(status) {
    var selected = this.state.select_list || {};
    var items_to_update = this.state.todos.filter(function(todo){return todo.id in selected && todo.status!==status;});
    var date_updated = strftime(util.date_format, new Date());
    items_to_update.forEach(function(todo){todo.status=status; todo.date_updated=date_updated});
    this.state.todos = this.state.todos.filter(function(todo){return this.state.status==='all' || todo.status===this.state.status;}.bind(this));
    // after update some items will be removed from view
    // remove them from select list as well
    var new_ids = setOf(this.state.todos.map(function(v){return v.id;}));
    this.state.select_list = setOf(Object.keys(this.state.select_list).filter(function(key){return key in new_ids;}));
    srv.backend.bulkDocs(items_to_update)
        .then(function(){return this.updated();}.bind(this));


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


},{"./couch_server":2,"./dispatcher":3,"./storage":7,"./util":9,"strftime":10}],9:[function(require,module,exports){

exports.date_format = "%Y-%m-%d %H:%M:%S.%L";
},{}],10:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Rhbi9naXQvdG9kb2xpc3Qvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZGFuL2dpdC90b2RvbGlzdC9idWlsZC9qcy9jb21wb25lbnRzLmpzIiwiL2hvbWUvZGFuL2dpdC90b2RvbGlzdC9idWlsZC9qcy9jb3VjaF9zZXJ2ZXIuanMiLCIvaG9tZS9kYW4vZ2l0L3RvZG9saXN0L2J1aWxkL2pzL2Rpc3BhdGNoZXIuanMiLCIvaG9tZS9kYW4vZ2l0L3RvZG9saXN0L2J1aWxkL2pzL2Zha2VfNWZhMzkxM2UuanMiLCIvaG9tZS9kYW4vZ2l0L3RvZG9saXN0L2J1aWxkL2pzL2xpbmsuanMiLCIvaG9tZS9kYW4vZ2l0L3RvZG9saXN0L2J1aWxkL2pzL3NldHRpbmdzLmpzIiwiL2hvbWUvZGFuL2dpdC90b2RvbGlzdC9idWlsZC9qcy9zdG9yYWdlLmpzIiwiL2hvbWUvZGFuL2dpdC90b2RvbGlzdC9idWlsZC9qcy90b2RvX3N0b3JhZ2UuanMiLCIvaG9tZS9kYW4vZ2l0L3RvZG9saXN0L2J1aWxkL2pzL3V0aWwuanMiLCIvaG9tZS9kYW4vZ2l0L3RvZG9saXN0L25vZGVfbW9kdWxlcy9zdHJmdGltZS9zdHJmdGltZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IFN0b3JhZ2VNaXhpbiA9IHJlcXVpcmUoJy4vdG9kb19zdG9yYWdlJykuRGlzcGF0Y2hlck1peGluO1xuY29uc3QgU2V0dGluZ3MgPSByZXF1aXJlKCcuL3NldHRpbmdzJykuU2V0dGluZ3M7XG5jb25zdCBMaW5rID0gcmVxdWlyZSgnLi9saW5rJykuTGluaztcblxuZnVuY3Rpb24gZjIoaSkge1xuICAgIHJldHVybiAoaTwxMD8nMCc6JycpK2kudG9TdHJpbmcoKTtcbn1cbmZ1bmN0aW9uIGZtdF9kYXRlKGFyZykge1xuICAgIHZhciBkdCA9ICh0eXBlb2YgYXJnPT0nc3RyaW5nJyk/bmV3IERhdGUoRGF0ZS5wYXJzZShhcmcpKTphcmc7XG4gICAgcmV0dXJuIGR0LmdldEZ1bGxZZWFyKCkgKyctJytmMihkdC5nZXRNb250aCgpKzEpICsnLScrZjIoZHQuZ2V0RGF0ZSgpKSArICcgJyArIGR0LmdldEhvdXJzKCkgKyc6JytmMihkdC5nZXRNaW51dGVzKCkpICsnOicrZjIoZHQuZ2V0U2Vjb25kcygpKTtcbn1cblxudmFyIEJ1dHRvblRvb2xiYXIgPSBSZWFjdEJvb3RzdHJhcC5CdXR0b25Ub29sYmFyO1xudmFyIEJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLkJ1dHRvbjtcbnZhciBEcm9wZG93bkJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLkRyb3Bkb3duQnV0dG9uO1xudmFyIFNwbGl0QnV0dG9uID0gUmVhY3RCb290c3RyYXAuU3BsaXRCdXR0b247XG52YXIgTWVudUl0ZW0gPSBSZWFjdEJvb3RzdHJhcC5NZW51SXRlbTtcbnZhciBJbnB1dCA9IFJlYWN0Qm9vdHN0cmFwLklucHV0O1xuXG5mdW5jdGlvbiB1cEZpcnN0KHMpIHtcbiAgICByZXR1cm4gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKStzLnNsaWNlKDEpLnRvTG93ZXJDYXNlKCk7XG59XG5cbmZ1bmN0aW9uIHN0YXR1c0NhcHRpb24oc3RhdHVzKSB7XG4gICAgcmV0dXJuIHVwRmlyc3Qoc3RhdHVzPT0nY2xvc2VkJz8nZG9uZSc6c3RhdHVzKTtcbn1cblxudmFyIFRvZG9JdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlRvZG9JdGVtXCIsXG4gICAgbWl4aW5zOiBbU3RvcmFnZU1peGluXSxcbiAgICBoYW5kbGVTZWxlY3Q6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZW1pdCgnaXRlbV9zZWxlY3RlZCcsIHtpZDp0aGlzLnByb3BzLnRhc2suaWQsIGNoZWNrZWQ6ZXZlbnQudGFyZ2V0LmNoZWNrZWR9KTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwidGFza1wifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImRlc2NyaXB0aW9uXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHt0eXBlOiBcImNoZWNrYm94XCIsIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZVNlbGVjdH0pLCBcIsKgXCIsIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRhc2suZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiYXR0cnNcIn0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcImZsb2F0X2xlZnRcIn0sICBmbXRfZGF0ZSh0aGlzLnByb3BzLnRhc2suZGF0ZV91cGRhdGVkKSApLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJmbG9hdF9yaWdodFwifSwgdGhpcy5wcm9wcy50YXNrLnN0YXR1cylcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xlYXJfYm90aDtcIn0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBEaWFsb2cxID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkRpYWxvZzFcIixcbiAgICBtaXhpbnM6IFtTdG9yYWdlTWl4aW5dLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtpZDogXCJkMVwiLCBjbGFzc05hbWU6IFwiZy1tb2RhbC1jb250YWluZXJcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoM1wiLCBudWxsLCBcIkFkZCBuZXcgdGFza1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChBcHBlbmRGb3JtLCB7dmlld19zdGF0dXM6IHRoaXMucHJvcHMub3B0c30pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBUb29sYmFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlRvb2xiYXJcIixcbiAgICBtaXhpbnM6IFtTdG9yYWdlTWl4aW5dLFxuICAgIG5ld1NlbGVjdDogZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgICAgIHRoaXMuZW1pdCgndmlld19zdGF0dXNfY2hhbmdlZCcsIHtzdGF0dXM6IHN0YXR1cywgc2VhcmNoX3ZhbHVlOiBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMuc2VhcmNoX3ZhbHVlKS52YWx1ZS50cmltKCl9KTtcbiAgICB9LFxuICAgIHNob3dEaWFsb2c6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2QxJykuc3R5bGUuZGlzcGxheT0nYmxvY2snO1xuICAgICAgICB0aGlzLmVtaXQoJ3Nob3dfZGlhbG9nJywge2RpYWxvZ0NsYXNzOiBEaWFsb2cxLCBvcHRzOnRoaXMucHJvcHMudmlld19zdGF0dXN9KTtcbiAgICB9LFxuICAgIGRlbGV0ZVNlbGVjdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdkZWxldGVfc2VsZWN0ZWQnKTtcbiAgICB9LFxuICAgIHVwZGF0ZVNlbGVjdGVkOiBmdW5jdGlvbihzdGF0dXMpIHtcbiAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGVfc2VsZWN0ZWQnLCBzdGF0dXMpO1xuICAgIH0sXG4gICAgdXBkYXRlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZV9zZWxlY3RlZCcsIHRoaXMucHJvcHMudmlld19zdGF0dXM9PT0naW4gcHJvY2Vzcyc/J2Nsb3NlZCc6J2luIHByb2Nlc3MnKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2aWV3X29wdGlvbnMgPSBbJ2FsbCcsICdiYWNrbG9nJywgJ2luIHByb2Nlc3MnLCAnaG9sZCcsICdjbG9zZWQnXTtcbiAgICAgICAgdmFyIG5leHRfc3RhdHVzID0gdGhpcy5wcm9wcy52aWV3X3N0YXR1cz09J2luIHByb2Nlc3MnPydjbG9zZWQnOidpbiBwcm9jZXNzJztcbiAgICAgICAgdmFyIHNlbGVjdGlvbl9lbXB0eSA9IE9iamVjdC5rZXlzKHRoaXMucHJvcHMuc2VsZWN0aW9uKS5sZW5ndGg9PT0wO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInRvb2xib3hcIn0sIFxuICAgICAgICAgICAgICAgIC8qPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHRcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiIGRhdGEtdGFyZ2V0PVwiI2FkZG5ldzJcIj5OZXc8L2J1dHRvbj4qL1xuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogdGhpcy5zaG93RGlhbG9nfSwgXCJOZXdcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRHJvcGRvd25CdXR0b24sIHt0aXRsZTogc3RhdHVzQ2FwdGlvbih0aGlzLnByb3BzLnZpZXdfc3RhdHVzKSwgb25TZWxlY3Q6IHRoaXMubmV3U2VsZWN0fSwgXG4gICAgICAgICAgICAgICAgICAgIHZpZXdfb3B0aW9ucy5tYXAoZnVuY3Rpb24oc3RhdHVzKVxuICAgICAgICAgICAgICAgICAgICAgICAge3JldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVJdGVtLCB7ZXZlbnRLZXk6IHN0YXR1cywga2V5OiBzdGF0dXN9LCBzdGF0dXNDYXB0aW9uKHN0YXR1cykpO30pXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgXCIgfCBcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU3BsaXRCdXR0b24sIHt0aXRsZTogc3RhdHVzQ2FwdGlvbihuZXh0X3N0YXR1cyksIGRpc2FibGVkOiBzZWxlY3Rpb25fZW1wdHksIG9uQ2xpY2s6IHRoaXMudXBkYXRlQ2xpY2ssIG9uU2VsZWN0OiB0aGlzLnVwZGF0ZVNlbGVjdGVkfSwgXG4gICAgICAgICAgICAgICAgICAgIHZpZXdfb3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24ob3B0KXtyZXR1cm4gb3B0IT09J2FsbCc7fSkubWFwKGZ1bmN0aW9uKHN0YXR1cylcbiAgICAgICAgICAgICAgICAgICAgICAgIHtyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChNZW51SXRlbSwge2V2ZW50S2V5OiBzdGF0dXMsIGtleTogc3RhdHVzfSwgc3RhdHVzQ2FwdGlvbihzdGF0dXMpKTt9KVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgdHlwZTogXCJidXR0b25cIiwgZGlzYWJsZWQ6IHNlbGVjdGlvbl9lbXB0eSwgb25DbGljazogdGhpcy5kZWxldGVTZWxlY3RlZH0sIFwiRGVsZXRlIHNlbGVjdGVkXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge3R5cGU6IFwidGV4dFwiLCByZWY6IFwic2VhcmNoX3ZhbHVlXCIsIGxhYmVsOiBcIlNlYXJjaFwifSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIEFwcGVuZEZvcm0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiQXBwZW5kRm9ybVwiLFxuICAgIG1peGluczogW1N0b3JhZ2VNaXhpbl0sXG4gICAgaGFuZGxlU3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IHRoaXMucmVmcy5zdGF0dXMuZ2V0RE9NTm9kZSgpLnZhbHVlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMucmVmcy5kZXNjcmlwdGlvbi5nZXRET01Ob2RlKCkudmFsdWVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5lbWl0KCdpdGVtX2FwcGVuZCcsIGRhdGEpO1xuICAgICAgICBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMuZGVzY3JpcHRpb24pLnZhbHVlPScnO1xuICAgICAgICB0aGlzLmVtaXQoJ2Nsb3NlX2RpYWxvZycpO1xuICAgIH0sXG4gICAgaGFuZGxlQ2FuY2VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdjbG9zZV9kaWFsb2cnKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtpZDogXCJhZGRuZXcyXCIsIGNsYXNzTmFtZTogXCJfX2NvbGxhcHNlXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidGV4dGFyZWFcIiwge3JlZjogXCJkZXNjcmlwdGlvblwiLCBjb2xzOiBcIjYwXCIsIHJvd3M6IFwiMTBcIn0pXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiLCB7cmVmOiBcInN0YXR1c1wiLCBkZWZhdWx0VmFsdWU6IHRoaXMucHJvcHMudmlld19zdGF0dXN9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIiwge3ZhbHVlOiBcImluIHByb2Nlc3NcIn0sIFwiaW4gcHJvY2Vzc1wiKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIsIHt2YWx1ZTogXCJiYWNrbG9nXCJ9LCBcImJhY2tsb2dcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiLCB7dmFsdWU6IFwiaG9sZFwifSwgXCJob2xkXCIpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIiwge3ZhbHVlOiBcImNsb3NlZFwifSwgXCJjbG9zZWRcIilcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgb25DbGljazogdGhpcy5oYW5kbGVTdWJtaXR9LCBcIlN1Ym1pdFwiKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgb25DbGljazogdGhpcy5oYW5kbGVDYW5jZWx9LCBcIkNhbmNlbFwiKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuY29uc3QgVG9kb0xpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiVG9kb0xpc3RcIixcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLnByb3BzLnRvZG9zLm1hcChmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChUb2RvSXRlbSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFzazogdGFzaywgXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3X3N0YXR1czogdGhpcy5wcm9wcy52aWV3X3N0YXR1cywgXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHRhc2suaWR9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgICAgICBpdGVtc1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuXG4gICAgfVxufSk7XG5cblxudmFyIFRvZG9QYWdlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlRvZG9QYWdlXCIsXG4gICAgbWl4aW5zOiBbU3RvcmFnZU1peGluXSxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzOiAnaW4gcHJvY2VzcycsXG4gICAgICAgICAgICB0b2RvczogW10sXG4gICAgICAgICAgICBkaWFsb2c6IG51bGwsXG4gICAgICAgICAgICBwYXRoOiAnaG9tZScsXG4gICAgICAgICAgICBzZWxlY3RfbGlzdDp7fVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVtaXQoJ2luaXRpYWxfbG9hZCcpO1xuICAgICAgICAvL3N0b3JhZ2Uub24oJ3VwZGF0ZScsIHRoaXMuc3RvcmFnZVVwZGF0ZWQpO1xuICAgIH0sXG4gICAgc3RvcmFnZVVwZGF0ZWQ6IGZ1bmN0aW9uKHN0b3JhZ2UpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShfLmFzc2lnbih7fSxzdG9yYWdlLnN0YXRlKSk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGlhbG9nO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kaWFsb2cpIHtcbiAgICAgICAgICAgIHZhciBEID0gdGhpcy5zdGF0ZS5kaWFsb2cuZGlhbG9nQ2xhc3M7XG4gICAgICAgICAgICBkaWFsb2cgPSBSZWFjdC5jcmVhdGVFbGVtZW50KEQsIHtvcHRzOiB0aGlzLnN0YXRlLmRpYWxvZy5vcHRzfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaWFsb2cgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYWdlO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5wYXRoPT0naG9tZScpIHtcbiAgICAgICAgICAgIHBhZ2UgPSAoXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuICAgICAgICAgICAgICAgIGRpYWxvZywgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChMaW5rLCB7cGF0aDogXCJzZXR0aW5nc1wifSwgXCJTZXR0aW5nc1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUb29sYmFyLCB7dmlld19zdGF0dXM6IHRoaXMuc3RhdGUuc3RhdHVzLCBzZWxlY3Rpb246IHRoaXMuc3RhdGUuc2VsZWN0X2xpc3R9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUb2RvTGlzdCwge3RvZG9zOiB0aGlzLnN0YXRlLnRvZG9zLCB2aWV3X3N0YXR1czogdGhpcy5zdGF0ZS5zdGF0dXN9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhZ2UgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFNldHRpbmdzLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFnZTtcbiAgICB9XG59KTtcblxuZXhwb3J0cy5yZW5kZXJfcm9vdCA9IGZ1bmN0aW9uKCkge1xuICAgIFJlYWN0LnJlbmRlcihSZWFjdC5jcmVhdGVFbGVtZW50KFRvZG9QYWdlLCBudWxsKSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKSk7XG59IiwiY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuY29uc3Qgc3RyZnRpbWUgPSByZXF1aXJlKCdzdHJmdGltZScpO1xuXG5jb25zdCBjb25uX3N0ciA9ICd0b2RvX2xvY2FsJztcblxuZnVuY3Rpb24gU2VydmVyKGNvbm5fc3RyLCBvcHRzKSB7XG4gICAgdGhpcy5iYWNrZW5kID0gUG91Y2hEQihjb25uX3N0ciwgb3B0cyk7XG59XG5cbmZ1bmN0aW9uIHNydjJsb2NhbCh0b2RvKSB7XG4gICAgdG9kby5pZD10b2RvLl9pZDtcbiAgICByZXR1cm4gdG9kbztcbn1cblxuZnVuY3Rpb24gZmluZEFsbChyZWdFeCwgcykge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICByZWdFeC5sYXN0SW5kZXg9MDtcbiAgICB3aGlsZSAobT1yZWdFeC5leGVjKHMpKSB7XG4gICAgICAgIHJlcy5wdXNoKG1bMF0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBlY2hvKG1zZykge1xuICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhtc2csIHZhbHVlKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGVycm9yKG1zZykge1xuICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZywgdmFsdWUpO1xuICAgIH1cbn1cblxuXG5cblNlcnZlci5wcm90b3R5cGUgPSB7XG4gICAgY3JlYXRlX3ZpZXdzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1haW4gPSB7XG4gICAgICAgICAgICBfaWQ6ICdfZGVzaWduL21haW4nLFxuICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICBhbGxfYnlfZGF0ZV91cGRhdGVkOiB7XG4gICAgICAgICAgICAgICAgICAgIG1hcDogZnVuY3Rpb24oZG9jKXtlbWl0KGRvYy5kYXRlX3VwZGF0ZWQsIG51bGwpO30udG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYnlfc3RhdHVzX2RhdGVfdXBkYXRlZDoge1xuICAgICAgICAgICAgICAgICAgICBtYXA6IGZ1bmN0aW9uKGRvYyl7ZW1pdChbZG9jLnN0YXR1cyxkb2MuZGF0ZV91cGRhdGVkXSxudWxsKTt9LnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJ5X3RhZ19zdGF0dXNfZGF0ZV91cGRhdGVkOiB7XG4gICAgICAgICAgICAgICAgICAgIG1hcDogZnVuY3Rpb24oZG9jKXtkb2MudGFncy5mb3JFYWNoKGZ1bmN0aW9uKHRhZyl7ZW1pdChbdGFnLGRvYy5zdGF0dXMsZG9jLmRhdGVfdXBkYXRlZF0sbnVsbCk7fSk7fS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJhY2tlbmQucHV0KG1haW4pLnRoZW4oZnVuY3Rpb24oKXtjb25zb2xlLmxvZygnb2snKX0pLmNhdGNoKGZ1bmN0aW9uKGVycil7Y29uc29sZS5lcnJvcihlcnIpO30pO1xuICAgIH0sXG4gICAgc3luYzogZnVuY3Rpb24oYXJncyl7XG4gICAgICAgIHZhciBiYWNrZW5kID0gdGhpcy5iYWNrZW5kO1xuICAgICAgICBjb25zdCBzZXR0aW5nc19rZXkgPSAnX2xvY2FsL3NldHRpbmdzX3JlbW90ZSc7XG4gICAgICAgIHZhciBzYXZlID0gZnVuY3Rpb24oZG9jKSB7XG4gICAgICAgICAgICBkZWxldGUgYXJncy5wYXNzd29yZDtcbiAgICAgICAgICAgIGFyZ3MuX2lkID0gc2V0dGluZ3Nfa2V5O1xuICAgICAgICAgICAgYXJncy5sYXN0X3N5bmNfZGF0ZSA9IHN0cmZ0aW1lKHV0aWwuZGF0ZV9mb3JtYXQsIG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgaWYgKGRvYykge1xuICAgICAgICAgICAgICAgIGFyZ3MuX3Jldj1kb2MuX3JldlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFja2VuZC5wdXQoYXJncyk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBvbkNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBiYWNrZW5kLmdldChzZXR0aW5nc19rZXkpXG4gICAgICAgICAgICAgICAgLnRoZW4oc2F2ZSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5zdGF0dXM9PTQwNCkge3NhdmUobnVsbCk7fVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgICAgIHZhciByZW1vdGUgPSBuZXcgUG91Y2hEQihhcmdzLnVybCwge2F1dGg6IHt1c2VybmFtZTphcmdzLnVzZXJuYW1lLHBhc3N3b3JkOmFyZ3MucGFzc3dvcmR9fSk7XG4gICAgICAgIHRoaXMuYmFja2VuZC5zeW5jKHJlbW90ZSlcbiAgICAgICAgICAgIC5vbignY29tcGxldGUnLCBvbkNvbXBsZXRlKVxuICAgICAgICAgICAgLm9uKCdlcnJvcicsIGVycm9yKCdlcnJvciBoYW5kbGVyIGNhbGxlZCcpKTtcbiAgICB9LFxuICAgIHNldF9zdGF0dXM6IGZ1bmN0aW9uKHRvZG8sIHN0YXR1cykge1xuICAgICAgICAvL3JldHVybiB0aGlzLnBvc3RfcHJvbWlzZSgnc2V0LXN0YXR1cycsIHtpZDogaWQsIHN0YXR1czogc3RhdHVzfSk7XG4gICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgICBfaWQ6IHRvZG8uaWQsXG4gICAgICAgICAgICBfcmV2OiB0b2RvLl9yZXYsXG4gICAgICAgICAgICBkYXRlX2NyZWF0ZWQ6IHRvZG8uZGF0ZV9jcmVhdGVkLFxuICAgICAgICAgICAgZGF0ZV91cGRhdGVkOiBzdHJmdGltZSh1dGlsLmRhdGVfZm9ybWF0LCBuZXcgRGF0ZSgpKSxcbiAgICAgICAgICAgIHRhZ3M6IHRvZG8udGFncyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0b2RvLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgc3RhdHVzOiBzdGF0dXNcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFja2VuZC5wdXQob2JqKTtcbiAgICB9LFxuICAgIGdldF9saXN0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHZhciB2aWV3ID0gJ21haW4vYWxsX2J5X2RhdGVfdXBkYXRlZCc7XG4gICAgICAgIHZhciBzdGFydGtleSA9IHt9O1xuICAgICAgICB2YXIgZW5ka2V5ID0gJyc7XG4gICAgICAgIGlmIChvcHRpb25zLnN0YXR1cyE9J2FsbCcpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNlYXJjaF92YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZpZXcgPSAnbWFpbi9ieV90YWdfc3RhdHVzX2RhdGVfdXBkYXRlZCc7XG4gICAgICAgICAgICAgICAgc3RhcnRrZXkgPSBbb3B0aW9ucy5zZWFyY2hfdmFsdWUsIG9wdGlvbnMuc3RhdHVzLCB7fV07XG4gICAgICAgICAgICAgICAgZW5ka2V5ID0gW29wdGlvbnMuc2VhcmNoX3ZhbHVlLCBvcHRpb25zLnN0YXR1c107XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZpZXcgPSAnbWFpbi9ieV9zdGF0dXNfZGF0ZV91cGRhdGVkJztcbiAgICAgICAgICAgICAgICBzdGFydGtleSA9IFtvcHRpb25zLnN0YXR1cywge31dO1xuICAgICAgICAgICAgICAgIGVuZGtleSA9IFtvcHRpb25zLnN0YXR1c11cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5iYWNrZW5kLnF1ZXJ5KHZpZXcsIHtkZXNjZW5kaW5nOiB0cnVlLCBzdGFydGtleTpzdGFydGtleSxpbmNsdWRlX2RvY3M6dHJ1ZSxyZWR1Y2U6ZmFsc2UsZW5ka2V5OmVuZGtleX0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihkYXRhKXtyZXR1cm4gZGF0YS5yb3dzLm1hcChmdW5jdGlvbihyb3cpe3JldHVybiBzcnYybG9jYWwocm93LmRvYyk7fSk7fSk7XG4gICAgfSxcbiAgICBhZGRfdG9kbzogZnVuY3Rpb24oZm9ybV9kYXRhKSB7XG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBmb3JtX2RhdGEuZGF0ZV9jcmVhdGVkID0gZm9ybV9kYXRhLmRhdGVfdXBkYXRlZCA9IHN0cmZ0aW1lKHV0aWwuZGF0ZV9mb3JtYXQsIG5vdyk7XG4gICAgICAgIGZvcm1fZGF0YS50YWdzID0gZmluZEFsbCgvI1xcdysoPzpcXC5cXHcrKSovZywgZm9ybV9kYXRhLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFja2VuZC5wb3N0KGZvcm1fZGF0YSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpe3JldHVybiB0aGlzLmJhY2tlbmQuZ2V0KGRhdGEuaWQpO30uYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHRvZG8pe3JldHVybiBzcnYybG9jYWwodG9kbyl9KTtcbiAgICB9LFxuICAgIGRlbGV0ZV90YXNrOiBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgIC8vcmV0dXJuIHRoaXMucG9zdF9wcm9taXNlKCdkZWxldGVfdGFzaycsIHtpZDogaWR9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFja2VuZC5yZW1vdmUodGFzayk7XG4gICAgfVxuXG59XG5cbi8vZXhwb3J0cy5zcnYgPSBuZXcgU2VydmVyKCdodHRwOi8vYWRtaW46YWRtaW5AbG9jYWxob3N0OjU5ODQvdG9kbycpO1xuZXhwb3J0cy5zcnYgPSBuZXcgU2VydmVyKGNvbm5fc3RyKTtcbiIsIi8vbmV4dFRpY2sgaW1wbGVtZW50YXRpb24gZ3JhdGVmdWxseSBzdGVhbGVkIGF0IFxuLy8gaHR0cDovL3RpbW5ldy5tZS9ibG9nLzIwMTQvMDYvMjMvcHJvY2Vzcy1uZXh0dGljay1pbXBsZW1lbnRhdGlvbi1pbi1icm93c2VyL1xubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxuZnVuY3Rpb24gRGlzcGF0Y2hlcigpIHtcblx0dGhpcy5saXN0ZW5lcnMgPSB7fTtcbn1cblxuRGlzcGF0Y2hlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudElkLCBoYW5kbGVyKSB7XG5cdHZhciBoYW5kbGVycyA9IHRoaXMubGlzdGVuZXJzW2V2ZW50SWRdXG5cdGlmICghaGFuZGxlcnMpIHtcblx0XHR0aGlzLmxpc3RlbmVyc1tldmVudElkXSA9IGhhbmRsZXJzID0gW107XG5cdH1cblx0aGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbn1cblxuRGlzcGF0Y2hlci5wcm90b3R5cGUudW5saXN0ZW4gPSBmdW5jdGlvbihldmVudElkLCBoYW5kbGVyKSB7XG5cdHZhciBoYW5kbGVycyA9IHRoaXMubGlzdGVuZXJzW2V2ZW50SWRdO1xuXHRpZiAoaGFuZGxlcnMpIHtcblx0XHRoYW5kbGVycyA9IGhhbmRsZXJzLmZpbHRlcihmdW5jdGlvbihoKXtyZXR1cm4gaCE9PWhhbmRsZXJ9KTtcblx0XHRpZiAoaGFuZGxlcnMpIHtcblx0XHRcdHRoaXMubGlzdGVuZXJzW2V2ZW50SWRdID0gaGFuZGxlcnM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRlbGV0ZSB0aGlzLmxpc3RlbmVyc1tldmVudElkXTtcblx0XHR9XG5cdH1cbn1cblxuLy8gY2FsIGhhbmRsZXJzIGFjeW5jaHJvbm91c2x5XG5EaXNwYXRjaGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnRJZCwgYXJncykge1xuXHRuZXh0VGljayhmdW5jdGlvbigpIHtcblx0XHR2YXIgaGFuZGxlcnMgPSB0aGlzLmxpc3RlbmVyc1tldmVudElkXTtcblx0XHRpZiAoaGFuZGxlcnMpIHtcblx0XHRcdGhhbmRsZXJzLmZvckVhY2goZnVuY3Rpb24oaCl7aChhcmdzKTt9KTtcblx0XHR9XG5cdH0uYmluZCh0aGlzKSk7XG59XG5cbmV4cG9ydHMuRGlzcGF0Y2hlciA9IERpc3BhdGNoZXI7IiwiXG53aW5kb3cucmVuZGVyX3Jvb3QgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMnKS5yZW5kZXJfcm9vdDtcblxud2luZG93LnRvZG9saXN0ID0ge1xuXHRzcnY6IHJlcXVpcmUoJy4vY291Y2hfc2VydmVyJykuc3J2XG59IiwiY29uc3QgU3RvcmFnZU1peGluID0gcmVxdWlyZSgnLi90b2RvX3N0b3JhZ2UnKS5EaXNwYXRjaGVyTWl4aW47XG5cbmV4cG9ydHMuTGluayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJMaW5rXCIsXG4gICAgbWl4aW5zOiBbU3RvcmFnZU1peGluXSxcbiAgICBoYW5kbGVDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnbGluaycsIHRoaXMucHJvcHMucGF0aCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7aHJlZjogXCIjXCIsIG9uQ2xpY2s6IHRoaXMuaGFuZGxlQ2xpY2t9LCB0aGlzLnByb3BzLmNoaWxkcmVuKVxuICAgICAgICAgICAgKTtcbiAgICB9XG59KTtcblxuIiwiY29uc3QgU3RvcmFnZU1peGluID0gcmVxdWlyZSgnLi90b2RvX3N0b3JhZ2UnKS5EaXNwYXRjaGVyTWl4aW47XG5jb25zdCBMaW5rID0gcmVxdWlyZSgnLi9saW5rJykuTGluaztcbmNvbnN0IHNydiA9IHJlcXVpcmUoJy4vY291Y2hfc2VydmVyJykuc3J2O1xuXG5leHBvcnRzLlNldHRpbmdzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlNldHRpbmdzXCIsXG4gICAgbWl4aW5zOiBbU3RvcmFnZU1peGluXSxcblx0Y3JlYXRlVmlld3M6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5lbWl0KCdjcmVhdGVfdmlld3MnKTtcblx0fSxcblx0c3luYzogZnVuY3Rpb24oKXtcblx0XHR2YXIgYXJncyA9IHtcblx0XHRcdHVybDogUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnJlcGxpY2F0aW9uX3VybCkudmFsdWUsXG5cdFx0XHR1c2VybmFtZTogUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnVzZXJuYW1lKS52YWx1ZSxcblx0XHRcdHBhc3N3b3JkOiBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMucGFzc3dvcmQpLnZhbHVlXG5cdFx0fTtcblx0XHR0aGlzLmVtaXQoJ3N5bmMnLCBhcmdzKTtcblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZW1pdCgnZ2V0X3N5bmNfcGFyYW1zJywgZnVuY3Rpb24ocGFyYW1zKXtcblx0XHRcdFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5yZXBsaWNhdGlvbl91cmwpLnZhbHVlPXBhcmFtcy51cmw7XG5cdFx0XHRSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMudXNlcm5hbWUpLnZhbHVlPXBhcmFtcy51c2VybmFtZTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChMaW5rLCB7cGF0aDogXCJob21lXCJ9LCBcIkhvbWVcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoMlwiLCBudWxsLCBcIlNldHRpbmdzIHBhZ2VcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgICAgICAgICAgXHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7aHJlZjogXCIjXCIsIG9uQ2xpY2s6IHRoaXMuY3JlYXRlVmlld3N9LCBcIkNyZWF0ZSB2aWV3c1wiKVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgXHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDNcIiwgbnVsbCwgXCJSZXBsaWNhdGlvblwiKSwgXG4gICAgICAgICAgICBcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG5cdCAgICAgICAgICAgIFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImxhYmVsXCIsIG51bGwsIFwic2VydmVyIHVybFwiKSwgXG5cdCAgICAgICAgICAgIFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtuYW1lOiBcInJlcGxpY2F0aW9uX3VybFwiLCB0eXBlOiBcInRleHRcIiwgcmVmOiBcInJlcGxpY2F0aW9uX3VybFwiLCBzaXplOiBcIjQwXCJ9KVxuXHQgICAgICAgICAgICApLCBcblx0ICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcblx0ICAgICAgICAgICAgXHRSZWFjdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwgbnVsbCwgXCJ1c2VybmFtZVwiKSwgXG5cdCAgICAgICAgICAgIFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtuYW1lOiBcInVzZXJuYW1lXCIsIHR5cGU6IFwidGV4dFwiLCByZWY6IFwidXNlcm5hbWVcIiwgZGVmYXVsdFZhbHVlOiBcImFkbWluXCIsIHNpemU6IFwiMzBcIn0pXG5cdCAgICAgICAgICAgICksIFxuXHQgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuXHQgICAgICAgICAgICBcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCBudWxsLCBcInBhc3N3b3JkXCIpLCBcblx0ICAgICAgICAgICAgXHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge25hbWU6IFwicGFzc3dvcmRcIiwgdHlwZTogXCJwYXNzd29yZFwiLCByZWY6IFwicGFzc3dvcmRcIiwgc2l6ZTogXCIzMFwifSlcblx0ICAgICAgICAgICAgKSwgXG5cdCAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge29uQ2xpY2s6IHRoaXMuc3luY30sIFwiU3luY1wiKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuIiwiXG5mdW5jdGlvbiBTdG9yYWdlKCkge1xuXHR0aGlzLmFjdGlvbnMgPSB7fTtcbn1cblxuU3RvcmFnZS5wcm90b3R5cGUudXBkYXRlX2V2ZW50ID0gJ3VwZGF0ZSc7XG5cblN0b3JhZ2UucHJvdG90eXBlLm1vdW50ID0gZnVuY3Rpb24oZGlzcGF0Y2hlcikge1xuXHRmb3IgKHZhciBhY3Rpb25faWQgaW4gdGhpcy5hY3Rpb25zKSB7XG5cdFx0ZGlzcGF0Y2hlci5vbihhY3Rpb25faWQsIHRoaXMuYWN0aW9uc1thY3Rpb25faWRdKTtcblx0fVxuXHR0aGlzLnVwZGF0ZWQgPSBmdW5jdGlvbigpIHtkaXNwYXRjaGVyLmVtaXQodGhpcy51cGRhdGVfZXZlbnQsIHRoaXMpfTtcbn1cblxuU3RvcmFnZS5wcm90b3R5cGUudW5tb3VudCA9IGZ1bmN0aW9uKGRpc3BhdGNoZXIpIHtcblx0Zm9yICh2YXIgYWN0aW9uX2lkIGluIHRoaXMuYWN0aW9ucykge1xuXHRcdGRpc3BhdGNoZXIudW5saXN0ZW4oYWN0aW9uX2lkLCB0aGlzLmFjdGlvbnNbYWN0aW9uX2lkXSk7XG5cdH1cblx0ZGVsZXRlIHRoaXMudXBkYXRlZDtcbn1cblxuU3RvcmFnZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spIHtcblx0dGhpcy5hY3Rpb25zW2V2ZW50XSA9IGNhbGxiYWNrLmJpbmQodGhpcyk7XG59XG5cbmV4cG9ydHMuU3RvcmFnZSA9IFN0b3JhZ2U7IiwiXG4vLyB2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuLy8gdmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuLy92YXIgc3J2ID0gcmVxdWlyZSgnLi9zZXJ2ZXInKS5zcnY7XG52YXIgc3J2ID0gcmVxdWlyZSgnLi9jb3VjaF9zZXJ2ZXInKS5zcnY7XG52YXIgU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZScpLlN0b3JhZ2U7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hlcicpLkRpc3BhdGNoZXI7XG5jb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5jb25zdCBzdHJmdGltZSA9IHJlcXVpcmUoJ3N0cmZ0aW1lJyk7XG5cbi8vZGlzcGF0Y2hlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuLy9zdG9yYWdlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuc3RvcmFnZSA9IG5ldyBTdG9yYWdlKCk7XG5cbnN0b3JhZ2Uuc3RhdGUgPSB7XG4gICAgc3RhdHVzOiAnaW4gcHJvY2VzcycsXG4gICAgdG9kb3M6IFtdLFxuICAgIHBhdGg6ICdob21lJyxcbiAgICBzZWxlY3RfbGlzdDoge31cbn07XG5cbnN0b3JhZ2Uub24oJ2NyZWF0ZV92aWV3cycsIGZ1bmN0aW9uKCl7XG4gICAgc3J2LmNyZWF0ZV92aWV3cygpO1xufSk7XG5cbnN0b3JhZ2Uub24oJ2luaXRpYWxfbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgIHNydi5nZXRfbGlzdCh7c3RhdHVzOiB0aGlzLnN0YXRlLnN0YXR1cywgc2VhcmNoX3ZhbHVlOicnfSkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdGhpcy5zdGF0ZS50b2RvcyA9IGRhdGE7XG4gICAgICAgIHRoaXMuc3RhdGUuc3RhdHVzID0gdGhpcy5zdGF0ZS5zdGF0dXM7XG4gICAgICAgIHRoaXMudXBkYXRlZCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59KTtcblxuc3RvcmFnZS5vbigndXBkYXRlX2l0ZW1fc3RhdHVzJywgZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBwcmVkID0gZnVuY3Rpb24odG9kbyl7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnN0YXR1cz09J2FsbCcgfHwgZGF0YS5uZXdfc3RhdHVzPT10aGlzLnN0YXRlLnN0YXR1cyB8fCB0b2RvLmlkIT1kYXRhLnRhc2suaWQ7XG4gICAgfS5iaW5kKHRoaXMpO1xuICAgIHNydi5zZXRfc3RhdHVzKGRhdGEudGFzaywgZGF0YS5uZXdfc3RhdHVzKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN0YXRlLnRvZG9zID0gdGhpcy5zdGF0ZS50b2Rvcy5maWx0ZXIocHJlZCk7XG4gICAgICAgIHRoaXMudXBkYXRlZCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59KTtcblxuc3RvcmFnZS5vbigndmlld19zdGF0dXNfY2hhbmdlZCcsIGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgIHNydi5nZXRfbGlzdChvcHRpb25zKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICB0aGlzLnN0YXRlLnRvZG9zID0gZGF0YTtcbiAgICAgICAgdGhpcy5zdGF0ZS5zdGF0dXMgPSBvcHRpb25zLnN0YXR1cztcbiAgICAgICAgdGhpcy5zZWxlY3RfbGlzdCA9IHt9O1xuICAgICAgICB0aGlzLnVwZGF0ZWQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xufSk7XG5cbnN0b3JhZ2Uub24oJ2l0ZW1fYXBwZW5kJywgIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBzcnYuYWRkX3RvZG8oZGF0YSkudGhlbihmdW5jdGlvbihpdGVtcyl7XG4gICAgICAgIGlmIChkYXRhLnN0YXR1cz09dGhpcy5zdGF0ZS5zdGF0dXMgfHwgdGhpcy5zdGF0ZS5zdGF0dXM9PSdhbGwnKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnRvZG9zID0gW2l0ZW1zXS5jb25jYXQodGhpcy5zdGF0ZS50b2Rvcyk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZWQoKTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG59KTtcblxuc3RvcmFnZS5vbignZGVsZXRlX2l0ZW0nLCBmdW5jdGlvbih0b2RvKSB7XG4gICAgc3J2LmRlbGV0ZV90YXNrKHRvZG8pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3RhdGUudG9kb3MgPSB0aGlzLnN0YXRlLnRvZG9zLmZpbHRlcihmdW5jdGlvbih0Mil7cmV0dXJuIHQyLmlkIT10b2RvLmlkfSk7XG4gICAgICAgIHRoaXMudXBkYXRlZCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59KTtcblxuc3RvcmFnZS5vbignc2hvd19kaWFsb2cnLCBmdW5jdGlvbihvcHRzKXtcbiAgICB0aGlzLnN0YXRlLmRpYWxvZyA9IG9wdHM7XG4gICAgY29uc29sZS5sb2coJ3Nob3dfZGlhbG9nJywgb3B0cyk7XG4gICAgdGhpcy51cGRhdGVkKCk7XG59KTtcblxuc3RvcmFnZS5vbignY2xvc2VfZGlhbG9nJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLnN0YXRlLmRpYWxvZyA9IG51bGw7XG4gICAgdGhpcy51cGRhdGVkKCk7XG59KTtcblxuc3RvcmFnZS5vbignbGluaycsIGZ1bmN0aW9uKHBhdGgpe1xuICAgIHRoaXMuc3RhdGUucGF0aD1wYXRoO1xuICAgIHRoaXMudXBkYXRlZCgpO1xufSk7XG5cbnN0b3JhZ2Uub24oJ3N5bmMnLCBmdW5jdGlvbihhcmdzKXtcbiAgICBzcnYuc3luYyhhcmdzKTtcbiAgICB0aGlzLnVwZGF0ZWQoKTtcbn0pO1xuXG5zdG9yYWdlLm9uKCdnZXRfc3luY19wYXJhbXMnLCBmdW5jdGlvbihjYWxsYmFjayl7XG4gICAgc3J2LmJhY2tlbmQuZ2V0KCdfbG9jYWwvc2V0dGluZ3NfcmVtb3RlJylcbiAgICAgICAgLnRoZW4oY2FsbGJhY2spO1xufSk7XG5cbnN0b3JhZ2Uub24oJ2l0ZW1fc2VsZWN0ZWQnLCBmdW5jdGlvbihhcmdzKXtcbiAgICB2YXIgc2VsZWN0X2xpc3Q9dGhpcy5zdGF0ZS5zZWxlY3RfbGlzdDtcbiAgICBpZiAoYXJncy5jaGVja2VkKSB7XG4gICAgICAgIHNlbGVjdF9saXN0W2FyZ3MuaWRdID0gMTtcbiAgICB9IGVsc2UgaWYgKGFyZ3MuaWQgaW4gc2VsZWN0X2xpc3QpIHtcbiAgICAgICAgZGVsZXRlIHNlbGVjdF9saXN0W2FyZ3MuaWRdXG4gICAgfVxuICAgIHRoaXMudXBkYXRlZCgpO1xufSk7XG5cbnN0b3JhZ2Uub24oJ2RlbGV0ZV9zZWxlY3RlZCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHNlbGVjdGVkID0gdGhpcy5zdGF0ZS5zZWxlY3RfbGlzdCB8fCB7fTtcbiAgICB2YXIgaXRlbXNfdG9fZGVsZXRlID0gdGhpcy5zdGF0ZS50b2Rvcy5maWx0ZXIoZnVuY3Rpb24odG9kbyl7cmV0dXJuIHRvZG8uaWQgaW4gc2VsZWN0ZWQ7fSk7XG4gICAgdGhpcy5zdGF0ZS50b2RvcyA9IHRoaXMuc3RhdGUudG9kb3MuZmlsdGVyKGZ1bmN0aW9uKHRvZG8pe3JldHVybiAhKHRvZG8uaWQgaW4gc2VsZWN0ZWQpO30pO1xuICAgIHRoaXMuc3RhdGUuc2VsZWN0X2xpc3Q9e307XG4gICAgaXRlbXNfdG9fZGVsZXRlLmZvckVhY2goZnVuY3Rpb24odG9kbyl7cmV0dXJuIHRvZG8uX2RlbGV0ZWQ9dHJ1ZTt9KTtcbiAgICBzcnYuYmFja2VuZC5idWxrRG9jcyhpdGVtc190b19kZWxldGUpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudXBkYXRlZCgpO30uYmluZCh0aGlzKSk7XG59KTtcblxuZnVuY3Rpb24gc2V0T2YoYXJyKSB7XG4gICAgdmFyIHJlcyA9IHt9O1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7cmV0dXJuIHJlc1trZXldPTE7fSk7XG4gICAgcmV0dXJuIHJlcztcbn1cblxuc3RvcmFnZS5vbigndXBkYXRlX3NlbGVjdGVkJywgZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgdmFyIHNlbGVjdGVkID0gdGhpcy5zdGF0ZS5zZWxlY3RfbGlzdCB8fCB7fTtcbiAgICB2YXIgaXRlbXNfdG9fdXBkYXRlID0gdGhpcy5zdGF0ZS50b2Rvcy5maWx0ZXIoZnVuY3Rpb24odG9kbyl7cmV0dXJuIHRvZG8uaWQgaW4gc2VsZWN0ZWQgJiYgdG9kby5zdGF0dXMhPT1zdGF0dXM7fSk7XG4gICAgdmFyIGRhdGVfdXBkYXRlZCA9IHN0cmZ0aW1lKHV0aWwuZGF0ZV9mb3JtYXQsIG5ldyBEYXRlKCkpO1xuICAgIGl0ZW1zX3RvX3VwZGF0ZS5mb3JFYWNoKGZ1bmN0aW9uKHRvZG8pe3RvZG8uc3RhdHVzPXN0YXR1czsgdG9kby5kYXRlX3VwZGF0ZWQ9ZGF0ZV91cGRhdGVkfSk7XG4gICAgdGhpcy5zdGF0ZS50b2RvcyA9IHRoaXMuc3RhdGUudG9kb3MuZmlsdGVyKGZ1bmN0aW9uKHRvZG8pe3JldHVybiB0aGlzLnN0YXRlLnN0YXR1cz09PSdhbGwnIHx8IHRvZG8uc3RhdHVzPT09dGhpcy5zdGF0ZS5zdGF0dXM7fS5iaW5kKHRoaXMpKTtcbiAgICAvLyBhZnRlciB1cGRhdGUgc29tZSBpdGVtcyB3aWxsIGJlIHJlbW92ZWQgZnJvbSB2aWV3XG4gICAgLy8gcmVtb3ZlIHRoZW0gZnJvbSBzZWxlY3QgbGlzdCBhcyB3ZWxsXG4gICAgdmFyIG5ld19pZHMgPSBzZXRPZih0aGlzLnN0YXRlLnRvZG9zLm1hcChmdW5jdGlvbih2KXtyZXR1cm4gdi5pZDt9KSk7XG4gICAgdGhpcy5zdGF0ZS5zZWxlY3RfbGlzdCA9IHNldE9mKE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuc2VsZWN0X2xpc3QpLmZpbHRlcihmdW5jdGlvbihrZXkpe3JldHVybiBrZXkgaW4gbmV3X2lkczt9KSk7XG4gICAgc3J2LmJhY2tlbmQuYnVsa0RvY3MoaXRlbXNfdG9fdXBkYXRlKVxuICAgICAgICAudGhlbihmdW5jdGlvbigpe3JldHVybiB0aGlzLnVwZGF0ZWQoKTt9LmJpbmQodGhpcykpO1xuXG5cbn0pO1xuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5zdG9yYWdlLm1vdW50KGRpc3BhdGNoZXIpO1xuXG5leHBvcnRzLkRpc3BhdGNoZXJNaXhpbiA9IHtcbiAgICBlbWl0OiBmdW5jdGlvbihldmVudCwgb3B0aW9ucykge1xuICAgICAgICBkaXNwYXRjaGVyLmVtaXQoZXZlbnQsIG9wdGlvbnMpO1xuICAgIH0sXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RvcmFnZVVwZGF0ZWQpIHtcbiAgICAgICAgICAgIGRpc3BhdGNoZXIub24oJ3VwZGF0ZScsIHRoaXMuc3RvcmFnZVVwZGF0ZWQpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnN0b3JhZ2VVcGRhdGVkKSB7XG4gICAgICAgICAgICBkaXNwYXRjaGVyLnVubGlzdGVuKCd1cGRhdGUnLCB0aGlzLnN0b3JhZ2VVcGRhdGVkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiXG5leHBvcnRzLmRhdGVfZm9ybWF0ID0gXCIlWS0lbS0lZCAlSDolTTolUy4lTFwiOyIsIi8vXG4vLyBzdHJmdGltZVxuLy8gZ2l0aHViLmNvbS9zYW1zb25qcy9zdHJmdGltZVxuLy8gQF9zanNcbi8vXG4vLyBDb3B5cmlnaHQgMjAxMCAtIDIwMTUgU2FtaSBTYW1odXJpIDxzYW1pQHNhbWh1cmkubmV0PlxuLy9cbi8vIE1JVCBMaWNlbnNlXG4vLyBodHRwOi8vc2pzLm1pdC1saWNlbnNlLm9yZ1xuLy9cblxuOyhmdW5jdGlvbigpIHtcblxuICAgIHZhciBEZWZhdWx0TG9jYWxlID0ge1xuICAgICAgICAgICAgZGF5czogWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddLFxuICAgICAgICAgICAgc2hvcnREYXlzOiBbJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddLFxuICAgICAgICAgICAgbW9udGhzOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXSxcbiAgICAgICAgICAgIHNob3J0TW9udGhzOiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ10sXG4gICAgICAgICAgICBBTTogJ0FNJyxcbiAgICAgICAgICAgIFBNOiAnUE0nLFxuICAgICAgICAgICAgYW06ICdhbScsXG4gICAgICAgICAgICBwbTogJ3BtJyxcbiAgICAgICAgICAgIGZvcm1hdHM6IHtcbiAgICAgICAgICAgICAgICBEOiAnJW0vJWQvJXknLFxuICAgICAgICAgICAgICAgIEY6ICclWS0lbS0lZCcsXG4gICAgICAgICAgICAgICAgUjogJyVIOiVNJyxcbiAgICAgICAgICAgICAgICBUOiAnJUg6JU06JVMnLFxuICAgICAgICAgICAgICAgIFg6ICclVCcsXG4gICAgICAgICAgICAgICAgYzogJyVhICViICVkICVYICVZJyxcbiAgICAgICAgICAgICAgICByOiAnJUk6JU06JVMgJXAnLFxuICAgICAgICAgICAgICAgIHY6ICclZS0lYi0lWScsXG4gICAgICAgICAgICAgICAgeDogJyVEJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0U3RyZnRpbWUgPSBuZXcgU3RyZnRpbWUoRGVmYXVsdExvY2FsZSwgMCwgZmFsc2UpLFxuICAgICAgICBpc0NvbW1vbkpTID0gdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcsXG4gICAgICAgIG5hbWVzcGFjZTtcblxuICAgIC8vIENvbW1vbkpTIC8gTm9kZSBtb2R1bGVcbiAgICBpZiAoaXNDb21tb25KUykge1xuICAgICAgICBuYW1lc3BhY2UgPSBtb2R1bGUuZXhwb3J0cyA9IGFkYXB0ZWRTdHJmdGltZTtcbiAgICAgICAgbmFtZXNwYWNlLnN0cmZ0aW1lID0gZGVwcmVjYXRlZFN0cmZ0aW1lO1xuICAgIH1cbiAgICAvLyBCcm93c2VycyBhbmQgb3RoZXIgZW52aXJvbm1lbnRzXG4gICAgZWxzZSB7XG4gICAgICAgIC8vIEdldCB0aGUgZ2xvYmFsIG9iamVjdC4gV29ya3MgaW4gRVMzLCBFUzUsIGFuZCBFUzUgc3RyaWN0IG1vZGUuXG4gICAgICAgIG5hbWVzcGFjZSA9IChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgfHwgKDEsZXZhbCkoJ3RoaXMnKTsgfSgpKTtcbiAgICAgICAgbmFtZXNwYWNlLnN0cmZ0aW1lID0gYWRhcHRlZFN0cmZ0aW1lO1xuICAgIH1cblxuICAgIC8vIERlcHJlY2F0ZWQgQVBJLCB0byBiZSByZW1vdmVkIGluIHYxLjBcbiAgICB2YXIgX3JlcXVpcmUgPSBpc0NvbW1vbkpTID8gXCJyZXF1aXJlKCdzdHJmdGltZScpXCIgOiBcInN0cmZ0aW1lXCI7XG4gICAgdmFyIF9kZXByZWNhdGlvbldhcm5pbmdzID0ge307XG4gICAgZnVuY3Rpb24gZGVwcmVjYXRpb25XYXJuaW5nKG5hbWUsIGluc3RlYWQpIHtcbiAgICAgICAgaWYgKCFfZGVwcmVjYXRpb25XYXJuaW5nc1tuYW1lXSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS53YXJuID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJbV0FSTklOR10gXCIgKyBuYW1lICsgXCIgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMS4wLiBJbnN0ZWFkLCB1c2UgYFwiICsgaW5zdGVhZCArIFwiYC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfZGVwcmVjYXRpb25XYXJuaW5nc1tuYW1lXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuYW1lc3BhY2Uuc3RyZnRpbWVUWiA9IGRlcHJlY2F0ZWRTdHJmdGltZVRaO1xuICAgIG5hbWVzcGFjZS5zdHJmdGltZVVUQyA9IGRlcHJlY2F0ZWRTdHJmdGltZVVUQztcbiAgICBuYW1lc3BhY2UubG9jYWxpemVkU3RyZnRpbWUgPSBkZXByZWNhdGVkU3RyZnRpbWVMb2NhbGl6ZWQ7XG5cbiAgICAvLyBBZGFwdCB0aGUgb2xkIEFQSSB3aGlsZSBwcmVzZXJ2aW5nIHRoZSBuZXcgQVBJLlxuICAgIGZ1bmN0aW9uIGFkYXB0Rm9yd2FyZHMoZm4pIHtcbiAgICAgICAgZm4ubG9jYWxpemUgPSBkZWZhdWx0U3RyZnRpbWUubG9jYWxpemUuYmluZChkZWZhdWx0U3RyZnRpbWUpO1xuICAgICAgICBmbi50aW1lem9uZSA9IGRlZmF1bHRTdHJmdGltZS50aW1lem9uZS5iaW5kKGRlZmF1bHRTdHJmdGltZSk7XG4gICAgICAgIGZuLnV0YyA9IGRlZmF1bHRTdHJmdGltZS51dGMuYmluZChkZWZhdWx0U3RyZnRpbWUpO1xuICAgIH1cblxuICAgIGFkYXB0Rm9yd2FyZHMoYWRhcHRlZFN0cmZ0aW1lKTtcbiAgICBmdW5jdGlvbiBhZGFwdGVkU3RyZnRpbWUoZm10LCBkLCBsb2NhbGUpIHtcbiAgICAgICAgLy8gZCBhbmQgbG9jYWxlIGFyZSBvcHRpb25hbCwgY2hlY2sgaWYgdGhpcyBpcyAoZm9ybWF0LCBsb2NhbGUpXG4gICAgICAgIGlmIChkICYmIGQuZGF5cykge1xuICAgICAgICAgICAgbG9jYWxlID0gZDtcbiAgICAgICAgICAgIGQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvY2FsZSkge1xuICAgICAgICAgICAgZGVwcmVjYXRpb25XYXJuaW5nKFwiYFwiICsgX3JlcXVpcmUgKyBcIihmb3JtYXQsIFtkYXRlXSwgW2xvY2FsZV0pYFwiLCBcInZhciBzID0gXCIgKyBfcmVxdWlyZSArIFwiLmxvY2FsaXplKGxvY2FsZSk7IHMoZm9ybWF0LCBbZGF0ZV0pXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdHJmdGltZSA9IGxvY2FsZSA/IGRlZmF1bHRTdHJmdGltZS5sb2NhbGl6ZShsb2NhbGUpIDogZGVmYXVsdFN0cmZ0aW1lO1xuICAgICAgICByZXR1cm4gc3RyZnRpbWUoZm10LCBkKTtcbiAgICB9XG5cbiAgICBhZGFwdEZvcndhcmRzKGRlcHJlY2F0ZWRTdHJmdGltZSk7XG4gICAgZnVuY3Rpb24gZGVwcmVjYXRlZFN0cmZ0aW1lKGZtdCwgZCwgbG9jYWxlKSB7XG4gICAgICAgIGlmIChsb2NhbGUpIHtcbiAgICAgICAgICAgIGRlcHJlY2F0aW9uV2FybmluZyhcImBcIiArIF9yZXF1aXJlICsgXCIuc3RyZnRpbWUoZm9ybWF0LCBbZGF0ZV0sIFtsb2NhbGVdKWBcIiwgXCJ2YXIgcyA9IFwiICsgX3JlcXVpcmUgKyBcIi5sb2NhbGl6ZShsb2NhbGUpOyBzKGZvcm1hdCwgW2RhdGVdKVwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlcHJlY2F0aW9uV2FybmluZyhcImBcIiArIF9yZXF1aXJlICsgXCIuc3RyZnRpbWUoZm9ybWF0LCBbZGF0ZV0pYFwiLCBfcmVxdWlyZSArIFwiKGZvcm1hdCwgW2RhdGVdKVwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RyZnRpbWUgPSBsb2NhbGUgPyBkZWZhdWx0U3RyZnRpbWUubG9jYWxpemUobG9jYWxlKSA6IGRlZmF1bHRTdHJmdGltZTtcbiAgICAgICAgcmV0dXJuIHN0cmZ0aW1lKGZtdCwgZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVwcmVjYXRlZFN0cmZ0aW1lVFooZm10LCBkLCBsb2NhbGUsIHRpbWV6b25lKSB7XG4gICAgICAgIC8vIGxvY2FsZSBpcyBvcHRpb25hbCwgY2hlY2sgaWYgdGhpcyBpcyAoZm9ybWF0LCBkYXRlLCB0aW1lem9uZSlcbiAgICAgICAgaWYgKCh0eXBlb2YgbG9jYWxlID09ICdudW1iZXInIHx8IHR5cGVvZiBsb2NhbGUgPT0gJ3N0cmluZycpICYmIHRpbWV6b25lID09IG51bGwpIHtcbiAgICAgICAgICAgIHRpbWV6b25lID0gbG9jYWxlO1xuICAgICAgICAgICAgbG9jYWxlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxvY2FsZSkge1xuICAgICAgICAgICAgZGVwcmVjYXRpb25XYXJuaW5nKFwiYFwiICsgX3JlcXVpcmUgKyBcIi5zdHJmdGltZVRaKGZvcm1hdCwgZGF0ZSwgbG9jYWxlLCB0eilgXCIsIFwidmFyIHMgPSBcIiArIF9yZXF1aXJlICsgXCIubG9jYWxpemUobG9jYWxlKS50aW1lem9uZSh0eik7IHMoZm9ybWF0LCBbZGF0ZV0pYCBvciBgdmFyIHMgPSBcIiArIF9yZXF1aXJlICsgXCIubG9jYWxpemUobG9jYWxlKTsgcy50aW1lem9uZSh0eikoZm9ybWF0LCBbZGF0ZV0pXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVwcmVjYXRpb25XYXJuaW5nKFwiYFwiICsgX3JlcXVpcmUgKyBcIi5zdHJmdGltZVRaKGZvcm1hdCwgZGF0ZSwgdHopYFwiLCBcInZhciBzID0gXCIgKyBfcmVxdWlyZSArIFwiLnRpbWV6b25lKHR6KTsgcyhmb3JtYXQsIFtkYXRlXSlgIG9yIGBcIiArIF9yZXF1aXJlICsgXCIudGltZXpvbmUodHopKGZvcm1hdCwgW2RhdGVdKVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdHJmdGltZSA9IChsb2NhbGUgPyBkZWZhdWx0U3RyZnRpbWUubG9jYWxpemUobG9jYWxlKSA6IGRlZmF1bHRTdHJmdGltZSkudGltZXpvbmUodGltZXpvbmUpO1xuICAgICAgICByZXR1cm4gc3RyZnRpbWUoZm10LCBkKTtcbiAgICB9XG5cbiAgICB2YXIgdXRjU3RyZnRpbWUgPSBkZWZhdWx0U3RyZnRpbWUudXRjKCk7XG4gICAgZnVuY3Rpb24gZGVwcmVjYXRlZFN0cmZ0aW1lVVRDKGZtdCwgZCwgbG9jYWxlKSB7XG4gICAgICAgIGlmIChsb2NhbGUpIHtcbiAgICAgICAgICAgIGRlcHJlY2F0aW9uV2FybmluZyhcImBcIiArIF9yZXF1aXJlICsgXCIuc3RyZnRpbWVVVEMoZm9ybWF0LCBkYXRlLCBsb2NhbGUpYFwiLCBcInZhciBzID0gXCIgKyBfcmVxdWlyZSArIFwiLmxvY2FsaXplKGxvY2FsZSkudXRjKCk7IHMoZm9ybWF0LCBbZGF0ZV0pXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVwcmVjYXRpb25XYXJuaW5nKFwiYFwiICsgX3JlcXVpcmUgKyBcIi5zdHJmdGltZVVUQyhmb3JtYXQsIFtkYXRlXSlgXCIsIFwidmFyIHMgPSBcIiArIF9yZXF1aXJlICsgXCIudXRjKCk7IHMoZm9ybWF0LCBbZGF0ZV0pXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdHJmdGltZSA9IGxvY2FsZSA/IHV0Y1N0cmZ0aW1lLmxvY2FsaXplKGxvY2FsZSkgOiB1dGNTdHJmdGltZTtcbiAgICAgICAgcmV0dXJuIHN0cmZ0aW1lKGZtdCwgZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVwcmVjYXRlZFN0cmZ0aW1lTG9jYWxpemVkKGxvY2FsZSkge1xuICAgICAgICBkZXByZWNhdGlvbldhcm5pbmcoXCJgXCIgKyBfcmVxdWlyZSArIFwiLmxvY2FsaXplZFN0cmZ0aW1lKGxvY2FsZSlgXCIsIF9yZXF1aXJlICsgXCIubG9jYWxpemUobG9jYWxlKVwiKTtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRTdHJmdGltZS5sb2NhbGl6ZShsb2NhbGUpO1xuICAgIH1cbiAgICAvLyBFbmQgb2YgZGVwcmVjYXRlZCBBUElcblxuICAgIC8vIFBvbHlmaWxsIERhdGUubm93IGZvciBvbGQgYnJvd3NlcnMuXG4gICAgaWYgKHR5cGVvZiBEYXRlLm5vdyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiArbmV3IERhdGUoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBTdHJmdGltZShsb2NhbGUsIGN1c3RvbVRpbWV6b25lT2Zmc2V0LCB1c2VVdGNUaW1lem9uZSkge1xuICAgICAgICB2YXIgX2xvY2FsZSA9IGxvY2FsZSB8fCBEZWZhdWx0TG9jYWxlLFxuICAgICAgICAgICAgX2N1c3RvbVRpbWV6b25lT2Zmc2V0ID0gY3VzdG9tVGltZXpvbmVPZmZzZXQgfHwgMCxcbiAgICAgICAgICAgIF91c2VVdGNCYXNlZERhdGUgPSB1c2VVdGNUaW1lem9uZSB8fCBmYWxzZSxcblxuICAgICAgICAgICAgLy8gd2Ugc3RvcmUgdW5peCB0aW1lc3RhbXAgdmFsdWUgaGVyZSB0byBub3QgY3JlYXRlIG5ldyBEYXRlKCkgZWFjaCBpdGVyYXRpb24gKGVhY2ggbWlsbGlzZWNvbmQpXG4gICAgICAgICAgICAvLyBEYXRlLm5vdygpIGlzIDIgdGltZXMgZmFzdGVyIHRoYW4gbmV3IERhdGUoKVxuICAgICAgICAgICAgLy8gd2hpbGUgbWlsbGlzZWNvbmQgcHJlY2lzZSBpcyBlbm91Z2ggaGVyZVxuICAgICAgICAgICAgLy8gdGhpcyBjb3VsZCBiZSB2ZXJ5IGhlbHBmdWwgd2hlbiBzdHJmdGltZSB0cmlnZ2VyZWQgYSBsb3Qgb2YgdGltZXMgb25lIGJ5IG9uZVxuICAgICAgICAgICAgX2NhY2hlZERhdGVUaW1lc3RhbXAgPSAwLFxuICAgICAgICAgICAgX2NhY2hlZERhdGU7XG5cbiAgICAgICAgZnVuY3Rpb24gX3N0cmZ0aW1lKGZvcm1hdCwgZGF0ZSkge1xuICAgICAgICAgICAgdmFyIHRpbWVzdGFtcDtcblxuICAgICAgICAgICAgaWYgKCFkYXRlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRUaW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VGltZXN0YW1wID4gX2NhY2hlZERhdGVUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICAgICAgX2NhY2hlZERhdGVUaW1lc3RhbXAgPSBjdXJyZW50VGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgICBfY2FjaGVkRGF0ZSA9IG5ldyBEYXRlKF9jYWNoZWREYXRlVGltZXN0YW1wKTtcblxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXAgPSBfY2FjaGVkRGF0ZVRpbWVzdGFtcDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX3VzZVV0Y0Jhc2VkRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaG93IHRvIGF2b2lkIGR1cGxpY2F0aW9uIG9mIGRhdGUgaW5zdGFudGlhdGlvbiBmb3IgdXRjIGhlcmU/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSB0aWVkIHRvIGdldFRpbWV6b25lT2Zmc2V0IG9mIHRoZSBjdXJyZW50IGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jYWNoZWREYXRlID0gbmV3IERhdGUoX2NhY2hlZERhdGVUaW1lc3RhbXAgKyBnZXRUaW1lc3RhbXBUb1V0Y09mZnNldEZvcihfY2FjaGVkRGF0ZSkgKyBfY3VzdG9tVGltZXpvbmVPZmZzZXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGltZXN0YW1wID0gX2NhY2hlZERhdGVUaW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGUgPSBfY2FjaGVkRGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcCA9IGRhdGUuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF91c2VVdGNCYXNlZERhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpICsgZ2V0VGltZXN0YW1wVG9VdGNPZmZzZXRGb3IoZGF0ZSkgKyBfY3VzdG9tVGltZXpvbmVPZmZzZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9wcm9jZXNzRm9ybWF0KGZvcm1hdCwgZGF0ZSwgX2xvY2FsZSwgdGltZXN0YW1wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9wcm9jZXNzRm9ybWF0KGZvcm1hdCwgZGF0ZSwgbG9jYWxlLCB0aW1lc3RhbXApIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRTdHJpbmcgPSAnJyxcbiAgICAgICAgICAgICAgICBwYWRkaW5nID0gbnVsbCxcbiAgICAgICAgICAgICAgICBpc0luU2NvcGUgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBmb3JtYXQubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGV4dGVuZGVkVFogPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDaGFyQ29kZSA9IGZvcm1hdC5jaGFyQ29kZUF0KGkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzSW5TY29wZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyAnLSdcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRDaGFyQ29kZSA9PT0gNDUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmcgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vICdfJ1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjdXJyZW50Q2hhckNvZGUgPT09IDk1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nID0gJyAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gJzAnXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGN1cnJlbnRDaGFyQ29kZSA9PT0gNDgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmcgPSAnMCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyAnOidcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY3VycmVudENoYXJDb2RlID09PSA1OCkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRlbmRlZFRaKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLndhcm4gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJbV0FSTklOR10gZGV0ZWN0ZWQgdXNlIG9mIHVuc3VwcG9ydGVkICU6OiBvciAlOjo6IG1vZGlmaWVycyB0byBzdHJmdGltZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kZWRUWiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGN1cnJlbnRDaGFyQ29kZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFeGFtcGxlcyBmb3IgbmV3IERhdGUoMCkgaW4gR01UXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICdUaHVyc2RheSdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ0EnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA2NTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gbG9jYWxlLmRheXNbZGF0ZS5nZXREYXkoKV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICdKYW51YXJ5J1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnQic6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY2OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBsb2NhbGUubW9udGhzW2RhdGUuZ2V0TW9udGgoKV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcxOSdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ0MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA2NzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gcGFkVGlsbDIoTWF0aC5mbG9vcihkYXRlLmdldEZ1bGxZZWFyKCkgLyAxMDApLCBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzAxLzAxLzcwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnRCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY4OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBfcHJvY2Vzc0Zvcm1hdChsb2NhbGUuZm9ybWF0cy5ELCBkYXRlLCBsb2NhbGUsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcxOTcwLTAxLTAxJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnRic6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDcwOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBfcHJvY2Vzc0Zvcm1hdChsb2NhbGUuZm9ybWF0cy5GLCBkYXRlLCBsb2NhbGUsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ0gnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA3MjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gcGFkVGlsbDIoZGF0ZS5nZXRIb3VycygpLCBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzEyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnSSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDczOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihob3VyczEyKGRhdGUuZ2V0SG91cnMoKSksIHBhZGRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnTCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDc2OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMyhNYXRoLmZsb29yKHRpbWVzdGFtcCAlIDEwMDApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnTSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDc3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihkYXRlLmdldE1pbnV0ZXMoKSwgcGFkZGluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICdhbSdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ1AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA4MDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gZGF0ZS5nZXRIb3VycygpIDwgMTIgPyBsb2NhbGUuYW0gOiBsb2NhbGUucG07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcwMDowMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ1InOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA4MjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gX3Byb2Nlc3NGb3JtYXQobG9jYWxlLmZvcm1hdHMuUiwgZGF0ZSwgbG9jYWxlLCB0aW1lc3RhbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdTJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgODM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9IHBhZFRpbGwyKGRhdGUuZ2V0U2Vjb25kcygpLCBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzAwOjAwOjAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnVCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDg0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBfcHJvY2Vzc0Zvcm1hdChsb2NhbGUuZm9ybWF0cy5ULCBkYXRlLCBsb2NhbGUsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ1UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA4NTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gcGFkVGlsbDIod2Vla051bWJlcihkYXRlLCAnc3VuZGF5JyksIHBhZGRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdXJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgODc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9IHBhZFRpbGwyKHdlZWtOdW1iZXIoZGF0ZSwgJ21vbmRheScpLCBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzE2OjAwOjAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnWCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDg4OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBfcHJvY2Vzc0Zvcm1hdChsb2NhbGUuZm9ybWF0cy5YLCBkYXRlLCBsb2NhbGUsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcxOTcwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnWSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDg5OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICdHTVQnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdaJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgOTA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF91c2VVdGNCYXNlZERhdGUgJiYgX2N1c3RvbVRpbWV6b25lT2Zmc2V0ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBcIkdNVFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZml4bWUgb3B0aW1pemVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHR6U3RyaW5nID0gZGF0ZS50b1N0cmluZygpLm1hdGNoKC9cXCgoW1xcd1xcc10rKVxcKS8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gdHpTdHJpbmcgJiYgdHpTdHJpbmdbMV0gfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnVGh1J1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDk3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBsb2NhbGUuc2hvcnREYXlzW2RhdGUuZ2V0RGF5KCldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnSmFuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnYic6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDk4OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBsb2NhbGUuc2hvcnRNb250aHNbZGF0ZS5nZXRNb250aCgpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJydcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ2MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA5OTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gX3Byb2Nlc3NGb3JtYXQobG9jYWxlLmZvcm1hdHMuYywgZGF0ZSwgbG9jYWxlLCB0aW1lc3RhbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDEnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihkYXRlLmdldERhdGUoKSwgcGFkZGluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICcgMSdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMDE6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9IHBhZFRpbGwyKGRhdGUuZ2V0RGF0ZSgpLCBwYWRkaW5nID09IG51bGwgPyAnICcgOiBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJ0phbidcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9IGxvY2FsZS5zaG9ydE1vbnRoc1tkYXRlLmdldE1vbnRoKCldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnaic6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEwNjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgeSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRheSA9IE1hdGguY2VpbCgoZGF0ZS5nZXRUaW1lKCkgLSB5LmdldFRpbWUoKSkgLyAoMTAwMCAqIDYwICogNjAgKiAyNCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMyhkYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnIDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdrJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTA3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihkYXRlLmdldEhvdXJzKCksIHBhZGRpbmcgPT0gbnVsbCA/ICcgJyA6IHBhZGRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMTInXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdsJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTA4OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihob3VyczEyKGRhdGUuZ2V0SG91cnMoKSksIHBhZGRpbmcgPT0gbnVsbCA/ICcgJyA6IHBhZGRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMDEnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTA5OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBwYWRUaWxsMihkYXRlLmdldE1vbnRoKCkgKyAxLCBwYWRkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJ1xcbidcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ24nOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMTA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9ICdcXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMXN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAnbyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDExMTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKSArIG9yZGluYWwoZGF0ZS5nZXREYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnQU0nXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICdwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTEyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBkYXRlLmdldEhvdXJzKCkgPCAxMiA/IGxvY2FsZS5BTSA6IGxvY2FsZS5QTTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzEyOjAwOjAwIEFNJ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAncic6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDExNDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gX3Byb2Nlc3NGb3JtYXQobG9jYWxlLmZvcm1hdHMuciwgZGF0ZSwgbG9jYWxlLCB0aW1lc3RhbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMTU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0U3RyaW5nICs9IE1hdGguZmxvb3IodGltZXN0YW1wIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICdcXHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICd0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTE2OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSAnXFx0JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzQnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICd1JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTE3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXkgPSBkYXRlLmdldERheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBkYXkgPT09IDAgPyA3IDogZGF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrOyAvLyAxIC0gNywgTW9uZGF5IGlzIGZpcnN0IGRheSBvZiB0aGUgd2Vla1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnIDEtSmFuLTE5NzAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICd2JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTE4OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSBfcHJvY2Vzc0Zvcm1hdChsb2NhbGUuZm9ybWF0cy52LCBkYXRlLCBsb2NhbGUsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICc0J1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAndyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDExOTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gZGF0ZS5nZXREYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhazsgLy8gMCAtIDYsIFN1bmRheSBpcyBmaXJzdCBkYXkgb2YgdGhlIHdlZWtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJzEyLzMxLzY5J1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSAneCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEyMDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gX3Byb2Nlc3NGb3JtYXQobG9jYWxlLmZvcm1hdHMueCwgZGF0ZSwgbG9jYWxlLCB0aW1lc3RhbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnNzAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICd5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTIxOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFN0cmluZyArPSAoJycgKyBkYXRlLmdldEZ1bGxZZWFyKCkpLnNsaWNlKDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnKzAwMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXNlICd6JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTIyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfdXNlVXRjQmFzZWREYXRlICYmIF9jdXN0b21UaW1lem9uZU9mZnNldCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gZXh0ZW5kZWRUWiA/IFwiKzAwOjAwXCIgOiBcIiswMDAwXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2ZmO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2N1c3RvbVRpbWV6b25lT2Zmc2V0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmYgPSBfY3VzdG9tVGltZXpvbmVPZmZzZXQgLyAoNjAgKiAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZiA9IC1kYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNpZ24gPSBvZmYgPCAwID8gJy0nIDogJysnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VwID0gZXh0ZW5kZWRUWiA/ICc6JyA6ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZiAvIDYwKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaW5zID0gTWF0aC5hYnMob2ZmICUgNjApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gc2lnbiArIHBhZFRpbGwyKGhvdXJzKSArIHNlcCArIHBhZFRpbGwyKG1pbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gZm9ybWF0W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlzSW5TY29wZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyAnJSdcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudENoYXJDb2RlID09PSAzNykge1xuICAgICAgICAgICAgICAgICAgICBpc0luU2NvcGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHRTdHJpbmcgKz0gZm9ybWF0W2ldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0U3RyaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0cmZ0aW1lID0gX3N0cmZ0aW1lO1xuXG4gICAgICAgIHN0cmZ0aW1lLmxvY2FsaXplID0gZnVuY3Rpb24obG9jYWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFN0cmZ0aW1lKGxvY2FsZSB8fCBfbG9jYWxlLCBfY3VzdG9tVGltZXpvbmVPZmZzZXQsIF91c2VVdGNCYXNlZERhdGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHN0cmZ0aW1lLnRpbWV6b25lID0gZnVuY3Rpb24odGltZXpvbmUpIHtcbiAgICAgICAgICAgIHZhciBjdXN0b21UaW1lem9uZU9mZnNldCA9IF9jdXN0b21UaW1lem9uZU9mZnNldDtcbiAgICAgICAgICAgIHZhciB1c2VVdGNCYXNlZERhdGUgPSBfdXNlVXRjQmFzZWREYXRlO1xuXG4gICAgICAgICAgICB2YXIgdGltZXpvbmVUeXBlID0gdHlwZW9mIHRpbWV6b25lO1xuICAgICAgICAgICAgaWYgKHRpbWV6b25lVHlwZSA9PT0gJ251bWJlcicgfHwgdGltZXpvbmVUeXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHVzZVV0Y0Jhc2VkRGF0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAvLyBJU08gODYwMSBmb3JtYXQgdGltZXpvbmUgc3RyaW5nLCBbLStdSEhNTVxuICAgICAgICAgICAgICAgIGlmICh0aW1lem9uZVR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzaWduID0gdGltZXpvbmVbMF0gPT09ICctJyA/IC0xIDogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdXJzID0gcGFyc2VJbnQodGltZXpvbmUuc2xpY2UoMSwgMyksIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZXMgPSBwYXJzZUludCh0aW1lem9uZS5zbGljZSgzLCA1KSwgMTApO1xuXG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbVRpbWV6b25lT2Zmc2V0ID0gc2lnbiAqICgoNjAgKiBob3VycykgKyBtaW51dGVzKSAqIDYwICogMTAwMDtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW4gbWludXRlczogNDIwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRpbWV6b25lVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tVGltZXpvbmVPZmZzZXQgPSB0aW1lem9uZSAqIDYwICogMTAwMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgU3RyZnRpbWUoX2xvY2FsZSwgY3VzdG9tVGltZXpvbmVPZmZzZXQsIHVzZVV0Y0Jhc2VkRGF0ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RyZnRpbWUudXRjID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFN0cmZ0aW1lKF9sb2NhbGUsIF9jdXN0b21UaW1lem9uZU9mZnNldCwgdHJ1ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHN0cmZ0aW1lO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhZFRpbGwyKG51bWJlclRvUGFkLCBwYWRkaW5nQ2hhcikge1xuICAgICAgICBpZiAocGFkZGluZ0NoYXIgPT09ICcnIHx8IG51bWJlclRvUGFkID4gOSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlclRvUGFkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYWRkaW5nQ2hhciA9PSBudWxsKSB7XG4gICAgICAgICAgICBwYWRkaW5nQ2hhciA9ICcwJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFkZGluZ0NoYXIgKyBudW1iZXJUb1BhZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYWRUaWxsMyhudW1iZXJUb1BhZCkge1xuICAgICAgICBpZiAobnVtYmVyVG9QYWQgPiA5OSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlclRvUGFkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1iZXJUb1BhZCA+IDkpIHtcbiAgICAgICAgICAgIHJldHVybiAnMCcgKyBudW1iZXJUb1BhZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJzAwJyArIG51bWJlclRvUGFkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhvdXJzMTIoaG91cikge1xuICAgICAgICBpZiAoaG91ciA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDEyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGhvdXIgPiAxMikge1xuICAgICAgICAgICAgcmV0dXJuIGhvdXIgLSAxMjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaG91cjtcbiAgICB9XG5cbiAgICAvLyBmaXJzdFdlZWtkYXk6ICdzdW5kYXknIG9yICdtb25kYXknLCBkZWZhdWx0IGlzICdzdW5kYXknXG4gICAgLy9cbiAgICAvLyBQaWxmZXJlZCAmIHBvcnRlZCBmcm9tIFJ1YnkncyBzdHJmdGltZSBpbXBsZW1lbnRhdGlvbi5cbiAgICBmdW5jdGlvbiB3ZWVrTnVtYmVyKGRhdGUsIGZpcnN0V2Vla2RheSkge1xuICAgICAgICBmaXJzdFdlZWtkYXkgPSBmaXJzdFdlZWtkYXkgfHwgJ3N1bmRheSc7XG5cbiAgICAgICAgLy8gVGhpcyB3b3JrcyBieSBzaGlmdGluZyB0aGUgd2Vla2RheSBiYWNrIGJ5IG9uZSBkYXkgaWYgd2VcbiAgICAgICAgLy8gYXJlIHRyZWF0aW5nIE1vbmRheSBhcyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrLlxuICAgICAgICB2YXIgd2Vla2RheSA9IGRhdGUuZ2V0RGF5KCk7XG4gICAgICAgIGlmIChmaXJzdFdlZWtkYXkgPT09ICdtb25kYXknKSB7XG4gICAgICAgICAgICBpZiAod2Vla2RheSA9PT0gMCkgLy8gU3VuZGF5XG4gICAgICAgICAgICAgICAgd2Vla2RheSA9IDY7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgd2Vla2RheS0tO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpcnN0RGF5T2ZZZWFyVXRjID0gRGF0ZS5VVEMoZGF0ZS5nZXRGdWxsWWVhcigpLCAwLCAxKSxcbiAgICAgICAgICAgIGRhdGVVdGMgPSBEYXRlLlVUQyhkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCkpLFxuICAgICAgICAgICAgeWRheSA9IE1hdGguZmxvb3IoKGRhdGVVdGMgLSBmaXJzdERheU9mWWVhclV0YykgLyA4NjQwMDAwMCksXG4gICAgICAgICAgICB3ZWVrTnVtID0gKHlkYXkgKyA3IC0gd2Vla2RheSkgLyA3O1xuXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHdlZWtOdW0pO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgb3JkaW5hbCBzdWZmaXggZm9yIGEgbnVtYmVyOiBzdCwgbmQsIHJkLCBvciB0aFxuICAgIGZ1bmN0aW9uIG9yZGluYWwobnVtYmVyKSB7XG4gICAgICAgIHZhciBpID0gbnVtYmVyICUgMTA7XG4gICAgICAgIHZhciBpaSA9IG51bWJlciAlIDEwMDtcblxuICAgICAgICBpZiAoKGlpID49IDExICYmIGlpIDw9IDEzKSB8fCBpID09PSAwIHx8IGkgPj0gNCkge1xuICAgICAgICAgICAgcmV0dXJuICd0aCc7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChpKSB7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiAnc3QnO1xuICAgICAgICAgICAgY2FzZSAyOiByZXR1cm4gJ25kJztcbiAgICAgICAgICAgIGNhc2UgMzogcmV0dXJuICdyZCc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUaW1lc3RhbXBUb1V0Y09mZnNldEZvcihkYXRlKSB7XG4gICAgICAgIHJldHVybiAoZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpIHx8IDApICogNjAwMDA7XG4gICAgfVxuXG59KCkpO1xuIl19
