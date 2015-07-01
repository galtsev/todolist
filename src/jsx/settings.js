const StorageMixin = require('./todo_storage').DispatcherMixin;
const Link = require('./link').Link;
const srv = require('./couch_server').srv;

exports.Settings = React.createClass({
    mixins: [StorageMixin],
    getInitialState: function(){
    	return {
    		last_sync_date: 'unknown'
    	};
    },
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
			this.setState({last_sync_date: params.last_sync_date});
		}.bind(this));
	},
    render: function(){
        return (
            <div>
                <Link path="home">Home</Link>
                <h2>Settings page</h2>
                <div>
                	<a href="#" onClick={this.createViews}>Create views</a>
                </div>
            	<h3>Replication</h3>
            	<div>
	            	<label>server url</label>
	            	<input name="replication_url" type="text" ref="replication_url" size="40"/>
	            </div>
	            <div>
	            	<label>username</label>
	            	<input name="username" type="text" ref="username" defaultValue="admin" size="30"/>
	            </div>
	            <div>
	            	<label>password</label>
	            	<input name="password" type="password" ref="password" size="30"/>
	            </div>
	            <div>Last sync: {this.state.last_sync_date}</div>
	            <button onClick={this.sync}>Sync</button>
            </div>
        );
    }
});
