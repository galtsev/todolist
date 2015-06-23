const StorageMixin = require('./todo_storage').DispatcherMixin;
const Link = require('./link').Link;

exports.Settings = React.createClass({
    mixins: [StorageMixin],
	createViews: function(){
		this.emit('create_views');
	},
    render: function(){
        return (
            <div>
                <Link path="home">Home</Link>
                <h2>Settings page</h2>
                <div>
                	<a href="#" onClick={this.createViews}>Create views</a>
                </div>
            </div>
        );
    }
});
