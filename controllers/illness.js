/**
 FILE:  illness.js (controller)
 PURPOSE: to serve requests to the server regarding illnesses.
 FUNCTIONS:
 - create a new illness >/
 - update an illness    >/
 - delete an illness    >/
 - get all symptoms     >/
 - get symptom by id    >/
 */


//import the necessary dependancies
var express = require('express'),
	router = express.Router(),
	Illness = require('../models/illness'),
	Schemas = require('../schemas');


/*
 ROUTE: GET @ ---/all
 PURPOSE: to collect all of the illnesses that are on record and send them back to the client.
 */
router.get('/', function (req, res) {
	console.log("GOT REQUEST!");
	var message = {};
	//use illness static function for getting illnesses from db
	Illness.getAll(function (err, illnesses) {
		//check for and handle errors
		if (err) {
			message.success = false;
			message.error = err;
		} else {
			var formattedIllnesses = [];
			//loop over each illnesses and prepare it for response
			for (var i = 0; i < illnesses.length; i++) {
				formattedIllnesses.push({illness: illnesses[i].getData()});
			}

			message.success = true;
			message.illnesses = formattedIllnesses;
		}
		res.json(message);
	});
});


/*
 ROUTE: GET @ ---/:id
 PURPOSE: to return the illness that is identified by the id provided by the client.
 NOTE: notice how the data of the request comes through the params obj from the req
 */
router.get('/:id', function (req, res) {
	var message = {};
	//get the data that the user has sent
	var data = req.params;
	//check that we have what we need
	if (!data.id) {
		message.error = "Bad request data. Missing parameters.";
		message.missingProperty = 'id';
		message.success = false;
		res.json(message);
	} else {

		//use illness static function for getting illnesses from db
		Illness.getById(data.id, function (err, illness) {
			//check for and handle errors
			if (err || !illness) {
				//send back a failure notice
				message.success = false;
				message.error = err || "No illnesses with an id: " + data.id;
			} else {
				//prepare a successful response message
				message.success = true;
				message.illness = illness.getData();
			}
			//send message
			res.json(message);
		});
	}
});


/*
 ROUTE: POST @ ---/new
 PURPOSE: to create a new illness with the data sent by the client.
 */
router.post("/", function (req, res) {
	var message = {};
	var data = req.body.illness;

	var dataInfo = Schemas.validateDataWithSchema(data, Schemas.illness);
	//if the data does not have a parameter for the name return a fail
	if (!dataInfo.valid) {
		message.error = "Bad request data. Missing parameters.";
		message.missingProperty = dataInfo.missingProperty;
		message.success = false;
		res.json(message);
	} else {

		//make a new illness with the data supplied
		var illness = new Illness(data);
		//save the illness to the database
		illness.save(function (err, newId) {
			//find out if it was successful
			if (err) {
				message.success = false;
				message.error = err;
			} else {
				message.success = true;
				message.newId = newId;
			}
			res.json(message);
		});
	}
});


router.put('/', function (req, res) {
	var message = {};
	var data = req.body.illness;
	var dataInfo = Schemas.validateDataWithSchema(data, Schemas.illness);

	if (!dataInfo.valid) {
		message.error = "Bad request data. Missing parameters.";
		message.missingProperty = dataInfo.missingProperty;
		message.success = false;
		res.json(message);
	} else {
		var illness = new Illness(data);
		illness.update(function (err) {
			console.log("update illness callback");
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
	// const dataInfo = Schemas.validateDataWithSchema(data, Schemas.illness);

	if (!id) {
		message.error = "Bad request data. Missing parameters.";
		message.missingProperty = "id";
		message.success = false;
		res.json(message);
	} else {
		Illness.getById(id, function (err, illness) {
			illness.delete(function (err) {
				if (err) {
					message.success = false;
					message.error = err;
				} else {
					message.success = true;
				}
				res.json(message);
			});
		});
	}
});


module.exports = router;