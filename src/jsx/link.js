const StorageMixin = require('./todo_storage').DispatcherMixin;

exports.Link = React.createClass({
    mixins: [StorageMixin],
    handleClick: function() {
        this.emit('link', this.props.path);
    },
    render: function(){
        return (
            <a href="#" onClick={this.handleClick}>{this.props.children}</a>
            );
    }
});

