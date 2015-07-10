//Decleration
//Libraries
var express 		= require('express');
var compression 	= require('compression');
var bodyParser 		= require('body-parser');
var mongoose 		= require('mongoose');
var config	 	= require('config');
var morgan 		= require('morgan');
var path		= require('path');
var Zillow 		= require('node-zillow');
//My Modules
var schema 		= require('./Schema.js');
//Schema
var Property 		= mongoose.model('Property',schema.property);
//Variables
var mongo_address 	= config.get('mongo.address');
var mongo_db 		= config.get('mongo.db');
var zws_id   		= config.get('zillow.zws-id');

//Functions
var connect = function() {
	mongoose.connect('mongodb://' + mongo_address + '/' + mongo_db);
}

var gracefulExit = function() {
	mongoose.connection.close(function () {
	console.log('Mongoose default connection with DB ' + mongo_address + ' is disconnected through app termination');
	process.exit(0);
	});
}

var start = function() {
	connect();
	var server = app.listen(80, function() {
		var host = server.address().address;
		var port = server.address().port
		console.log('Listening on %s:%s', host, port);
	});
}

//Event Handlers
mongoose.connection.on("error", function(err) {
	console.error('Failed to connect to DB ' + mongo_address + ' on startup ', err);
});
 
mongoose.connection.on('disconnected', function () {
	console.log('Mongoose default connection to DB ' + mongo_address + ' disconnected');
});

mongoose.connection.on('connected', function() {
	console.log('Mongoose connected to DB ' + mongo_address);
}); 

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);
process.on('SIGUSR2', gracefulExit);

//Initialization
var app 		= express();
var zillow 		= new Zillow(zws_id);

//Middleware
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.json());


//Routes
app.use('/js', express.static(path.join(__dirname, 'public/html/js')));                                                        
app.use('/css', express.static(path.join(__dirname, 'public/html/css')));                                                         
app.use('/font-awesome', express.static(path.join(__dirname, 'public/html/font-awesome')));                                       
app.use('/images', express.static(path.join(__dirname, 'public/html/images'))); 

app.use(express.static(path.join(__dirname, 'public')));

//Endpoint : property
//Description : Endpoint to manipulate a real estate property data entity
app.post('/property', function(req, res) {
	var data = req.body;
	var property = new Property(data);
	property.save(function(err) {
		if (err) {
			console.error('Failed to save element. Error : ' + err);
			res.status(500).send('Failed to save element');	
		}
		else {
			res.status(200).send('Success!');
		}
	});
});

app.get('/property', function(req, res) {
	Property.find()
	.exec(function(error, results) {
		if (error) {
			console.log('Failed to get elements. Error : ' + error);
			res.status(500).send('Failed to get elements');
		}
		else {
			console.log(results);
			res.status(200).send(results);
		}
	});
});

app.get('/property/:id', function(req, res) {
	Property.findOne( { 'id' : req.params['id'] } , function(error, result) {
		if (error) {
			console.log('Failed to get element for id ' + req.params['id'] + ' Error : ' + error);
			res.status(500).send('Failed to get element');
		}
		else if (!result) {
			res.status(404).send();
		}
		else {
			res.status(200).send(result);
		}
	});
});

app.delete('/property/:id', function(req, res) {
	Property.findOneAndRemove( { 'id': req.params['id'] } , function(error, result) {
		if (error) {
			console.log('Failed to delete element for id ' + req.params['id'] + ' Error : ' + error);
			res.status(500).send('Failed to delete element');
		}
		else {
			res.status(204).send();
		}
	});
});

app.delete('/property', function(req, res) {
	Property.find()
	.remove(function(error, result) {
		if (error) {
			console.log('Failed to delete elements Error : ' + error);
			res.status(500).send('Failed to delete elements');
		}
		else {
			res.status(204).send();
		}
	});
});

//Execution
module.exports = app;
