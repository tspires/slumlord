var request = require('supertest');
var app = require('../Slumlord.js');

request(app)
	.get('/property')
	.end(function(error, result) {
		if (error) {
			console.log(error);
		}
		else {
			console.log(result);
		}
	});
