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

var TodoItem = React.createClass({
    mixins: [StorageMixin],
    handleSelect: function(event) {
        this.emit('item_selected', {id:this.props.task.id, checked:event.target.checked});
    },
    render: function() {
        return (
            <div className="task">
                <div className="description">
                    <input type="checkbox" onChange={this.handleSelect} />&nbsp;
                    {this.props.task.description}
                </div>
                <div className="attrs">
                    <span className="float_left">{ fmt_date(this.props.task.date_updated) }</span>
                    <span className="float_right">{this.props.task.status }</span>
                </div>
                <div className="clear_both;"></div>
            </div>
        );
    }
});

var Dialog1 = React.createClass({
    mixins: [StorageMixin],
    render: function() {
        return (
            <div id="d1" className="g-modal-container">
                <h3>Add new task</h3>
                <AppendForm view_status={this.props.opts} />
            </div>
        );
    }
});

var Toolbar = React.createClass({
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
        return (
            <div className="toolbox">
                {/*<button className="btn btn-default" type="button" data-toggle="collapse" data-target="#addnew2">New</button>*/}
                <button className="btn btn-default" type="button" onClick={this.showDialog}>New</button>
                <DropdownButton title={statusCaption(this.props.view_status)} onSelect={this.newSelect}>
                    {view_options.map(status=>
                        <MenuItem eventKey={status} key={status}>{statusCaption(status)}</MenuItem>)}
                </DropdownButton>
                <span> | </span>
                <SplitButton title={statusCaption(next_status)} onClick={this.updateClick} onSelect={this.updateSelected}>
                    {view_options.filter(opt=>opt!=='all').map(status=>
                        <MenuItem eventKey={status} key={status}>{statusCaption(status)}</MenuItem>)}
                </SplitButton>
                <button className="btn btn-default" type="button" onClick={this.deleteSelected}>Delete selected</button>
                <input type="text" ref="search_value" label="Search"/>
            </div>
        );
    }
});

var AppendForm = React.createClass({
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
            <div id="addnew2" className="__collapse">
                <div>
                    <textarea ref="description" cols="60" rows="10"></textarea>
                </div>
                <div>
                    <select ref="status" defaultValue={this.props.view_status}>
                        <option value="in process">in process</option>
                        <option value="backlog">backlog</option>
                        <option value="hold">hold</option>
                        <option value="closed">closed</option>
                    </select>
                </div>
                <div>
                    <button className="btn btn-default" onClick={this.handleSubmit}>Submit</button>
                    <button className="btn btn-default" onClick={this.handleCancel}>Cancel</button>
                </div>
            </div>
        );
    }
});

const TodoList = React.createClass({
    render: function() {
        var items = this.props.todos.map(function(task) {
            return <TodoItem 
                        task={task}
                        view_status={this.props.view_status}
                        key={task.id} />;
        }.bind(this));
        return (
            <div>
            {items}
            </div>
        );

    }
});


var TodoPage = React.createClass({
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
            dialog = <D opts={this.state.dialog.opts} />;
        } else {
            dialog = <div />;
        }
        var page;
        if (this.state.path=='home') {
            page = (
            <div>
                {dialog}
                <Link path="settings">Settings</Link>
                <Toolbar view_status={this.state.view_status} />
                <TodoList todos={this.state.todos} view_status={this.state.view_status} />
            </div>
            );
        } else {
            page = <Settings />;
        }
        return page;
    }
});

exports.render_root = function() {
    React.render(<TodoPage />, document.getElementById('list'));
}