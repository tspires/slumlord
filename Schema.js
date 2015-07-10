var mongoose = require('mongoose');

var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;


var Property = new Schema({
	id	: ObjectId,
	address : String,
	city	: String,
	state	: String,
	zip	: String,
	price	: Number
});

module.exports = {
	property : Property
};
