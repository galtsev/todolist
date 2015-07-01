
exports.date_format = "%Y-%m-%d %H:%M:%S.%L";

url_regex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

exports.markup_map = {
	'text': function(text) {
		return text.replace(url_regex, '<a target="_blank" href="$&">$&</a>');
		//return text.replace(/https?:\/\/[^\s]+/g, '<a target="_blank" href="$&">$&</a>');
	}
}