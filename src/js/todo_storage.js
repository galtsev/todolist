
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

