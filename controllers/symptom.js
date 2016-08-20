/**
 symptom.js (controller)
 Purpose: to serve requests to the server regarding symptoms.
 Functions:
 	- create a new symptom  >/
    - update a symptom      >/
    - delete a symptom      >/
 	- get all symptoms      >/
 	- get symptom by id     >/
 */


//import the needed libraries and such
var express = require('express'),
	router = express.Router(),
	Symptom = require('../models/symptom'),
	Schemas = require('../schemas');




/*
 ROUTE: GET @ ---/all
 PURPOSE: to retrieve all of the symptoms currently listed in the database
 */
router.get('/', function (req, res) {
	var message = {};
	//use symptom's static function for getting symptoms from db
	Symptom.getAll(function (err, symptoms) {
		//check for and handle errors
		if (err) {
			message.success = false;
			message.error = err;
		} else {
			//there is no error, send back the data
			var formattedSymptoms = [];
			for (var i=0; i<symptoms.length; i++) {
				formattedSymptoms[i] = {symptom: symptoms[i].getData()}
			}

			message.success = true;
			message.symptoms = formattedSymptoms;
		}
		res.json(message);
	});
});



/*
 ROUTE: GET @ ---/:id
 PURPOSE: server requests for specific symptoms identified by an id provided by the client
 NOTE: see that the data comes through the params prop in the req.
 */
router.get('/:id', function (req, res) {
	//get the request data
	var data = req.params;
	//if there is no id in the request data then return a fail
	if (!data.id) {
		res.json({
			success: false,
			error: "bad id passed"
		});
		return;
	}

	//use symptom static function for getting symptoms from db
	Symptom.getById(data.id, function (err, symptom) {
		//check for and handle errors
		if (err) {
			//send back a failure notice
			res.json({
				success: false
			});
		} else {
			//there is no error, make sure symptom isnt null
			if (symptom) {
				//the symptom didnt exist.
				res.json({
					success: true,
					symptom: symptom.getData()

				});
			} else {
				//valid symptom without error. return normal
				res.json({
					success: true,
					error: "No symptom with an id: " + data.id
				});
			}
		}
	});
});







/*
	ROUTE: POST @ ---/new
	PURPOSE: handle requests to add new symptoms to the database
*/
router.post('/', function (req, res) {
	console.log(req);
	//get the data
	var message = {};
	var data = req.body.symptom;
	var dataInfo = Schemas.validateDataWithSchema(data, Schemas.symptom);
	//if the data does not have a parameter for the name return a fail
	if (!dataInfo.valid) {
		message.error = "Bad request data. Missing parameters.";
		message.missingProperty = dataInfo.missingProperty;
		message.success = false;
		res.json(message);
	} else {

		//make a new symptom from the data given
		var symptom = new Symptom(data);
		//save the symptom to the database
		symptom.save(function (err) {
			//find out if it was successful
			if (err) {
				message.error = err;
				message.success = false;
			} else {
				message.success = true;
			}
			res.json(message);
		});
	}
});







router.put('/', function (req, res) {
	var message = {};
	var data = req.body.symptom;
	var dataInfo = Schemas.validateDataWithSchema(data, Schemas.symptom);

	if (!dataInfo.valid) {
		message.error = "Bad request data. Missing parameters.";
		message.missingProperty = dataInfo.missingProperty;
		message.success = false;
		res.json(message);
	} else {
		var symptom = new Symptom(data);
		symptom.update(function (err) {
			console.log("update symptom callback");
			if (err) {
				message.success = false;
				message.error = err;
			} else {
				message.success = true;
			}
			res.json(message);
		})
	}
});

router.delete('/:id', function (req, res) {
	var message = {};
	const id = req.params.id;
	// const dataInfo = Schemas.validateDataWithSchema(data, Schemas.symptom);

	if (!id) {
		message.error = "Bad request data. Missing parameters.";
		message.missingProperty = "id";
		message.success = false;
		res.json(message);
	} else {
		Symptom.getById(id, function (err, symptom) {
			if (err) {
				message.success = false;
				message.error = err;
				res.json(message);
			} else {
				symptom.delete(function (err) {
					if (err) {
						message.success = false;
						message.error = err;
					} else {
						message.success = true;
					}
					res.json(message);
				});
			}
		});
	}
});




//export all of the routes that have been defined
module.exports = router;