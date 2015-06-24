
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
    var items_to_delete = this.state.todos.filter(todo=>todo.id in selected);
    this.state.todos = this.state.todos.filter(todo=>!(todo.id in selected));
    this.state.select_list={};
    items_to_delete.forEach(todo=>todo._deleted=true);
    srv.backend.bulkDocs(items_to_delete)
        .then(()=>this.updated());
});

function setOf(arr) {
    var res = {};
    arr.forEach(key=>res[key]=1);
    return res;
}

storage.on('update_selected', function(status) {
    var selected = this.state.select_list || {};
    var items_to_update = this.state.todos.filter(todo=>todo.id in selected && todo.status!==status);
    var date_updated = strftime(util.date_format, new Date());
    items_to_update.forEach(todo=>{todo.status=status; todo.date_updated=date_updated});
    this.state.todos = this.state.todos.filter(todo=>this.state.status==='all' || todo.status===this.state.status);
    // after update some items will be removed from view
    // remove them from select list as well
    var new_ids = setOf(this.state.todos.map(v=>v.id));
    this.state.select_list = setOf(Object.keys(this.state.select_list).filter(key=>key in new_ids));
    srv.backend.bulkDocs(items_to_update)
        .then(()=>this.updated());


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

