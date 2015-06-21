const pouchdb = require('pouchdb');
const strftime = require('strftime');

function Server(conn_str, opts) {
    this.backend = pouchdb(conn_str, opts);
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

Server.prototype = {
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
        var startkey = [{}];
        var endkey = []
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

exports.srv = new Server('http://admin:admin@localhost:5984/todo');