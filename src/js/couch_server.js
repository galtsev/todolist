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
