/**
 relations.js (controller)
 Purpose: to serve requests to the server regarding illnesses symptom relations.
 Functions:
 - link an illness to a list of symptoms  >/
 - link a symptom to a list of illnesses  >/
 - remove link                            >/
 - get all illnesses related to a symptom >/
 - get all symptoms related to an illness >/
 */


//import necessary modules
var express = require('express'),
	router = express.Router(),
	Relations = require('../utilities/relations'),
	async = require('async');


///////////////////////////////////////////////////////////////////
/*                   Illness 1-many Symptom						 */
///////////////////////////////////////////////////////////////////


/**
 ROUTE: GET @ ---/allSymptomsFromIllness/:id
 PURPOSE: to retrieve and return a list of ever symptom that is linked to an illness identified by id.
 REQUEST VALUES: id: identifier of the illness to grab related symptoms
 */
router.get('/allSymptomsFromIllness/:id', function (req, res) {
	var message = {};
	//get request data
	var data = req.params;
	//check if id is included. if not kill it
	if (!data.id) {
		message.error = "Missing Illness id";
		message.success = false;
		res.json(message);
	} else {
		//get the symptoms related to the illness given by id
		Relations.getSymptomsLinkedToIllness(data.id,
			function (err, symptoms) {
				//check for errors
				if (err) {
					message.success = false;
					message.error = err;
					console.log(err);
				} else {
					message.success = true;
					var formattedSymptoms = [];
					for (var i = 0; i < symptoms.length; i++) {
						formattedSymptoms[i] = {
							symptom: symptoms[i].getData()
						}
					}
					message.symptoms = formattedSymptoms;
				}

				//send back the success result as well as related symptoms
				res.json(message);
			}
		);
	}
});


/*
 ROUTE: POST @ ---/createIllnessRelations
 PURPOSE: to create a new relation between an illness and a list of symptoms
 REQUEST VALUES: illnessId: the id of the illness to be related to a list of symptoms
 symptomIds: list of symptom ids to be related to an illness
 */
router.post('/createIllnessSymptomRelations', function (req, res) {
	var message = {};
	//get the request data
	var data = req.body;
	//if there is no id in the request data then return a fail
	if (!data.illnessId || !data.symptomIds) {
		message.success = false;
		message.error = "Bad or missing parameters";
		res.json(message);
	} else {
		//put the data into vars. mostly for the array split
		var illnessId = data.illnessId;
		var symptomIds = data.symptomIds; //.split(',');

		//link the illness and symptoms
		Relations.linkSymptomsToIllness(illnessId, symptomIds,
			function (err, successfulEntries, unsuccessfulEntries, duplicateEntries) {
				//check for an error
				if (err) {
					console.log(err);
					message.success = false;
					message.error = err;
				} else {
					message.success = true;
				}
				//return the success result as well as the result of relations
				message.successfulEntries = successfulEntries;
				message.unsuccessfulEntries = unsuccessfulEntries;
				message.duplicateEntries = duplicateEntries;
				res.json(message);
			}
		);
	}
});


///////////////////////////////////////////////////////////////////
/*                   Symptom 1-many Illness						 */
///////////////////////////////////////////////////////////////////

/**
 ROUTE: GET @ ---/allIllnessesFromSymptom/:id
 PURPOSE: to retrieve and return a list of ever symptom that is linked to an illness identified by id.
 REQUEST VALUES: id: identifier of the illness to grab related symptoms
 */
router.get('/allIllnessesFromSymptom/:id', function (req, res) {
	var message = {};
	//get the request data
	var data = req.params;

	//check if id was included. if not kill it
	if (!data.id) {
		message.error = "Missing Illness id";
		message.success = false;
		res.json(message);
	} else {
		//get the illnesses linked ot the symptom by id
		Relations.getIllnessesLinkedToSymptom(data.id,
			function (err, illnesses) {
				//check for errors
				if (err) {
					message.success = false;
					message.error = err;
					console.log(err);
				} else {
					message.success = true;
					var formattedIllnesses = [];
					for (var i = 0; i < illnesses.length; i++) {
						formattedIllnesses[i] = {
							symptom: illnesses[i].getData()
						}
					}
					message.illnesses = formattedIllnesses;
				}

				//send back the success result as well as related symptoms
				res.json(message);
			});
	}
});


/*
 ROUTE: POST @ ---/createSymptomRelations
 PURPOSE: to create a new relation between a symptom and a list of illnesses
 REQUEST VALUES: symptomId: the id of the symptom to be related to a list of illnesses
 illnessIds: list of illnesses ids to be related to an symptom
 */
router.post('/createSymptomIllnessRelations', function (req, res) {
	var message = {};
	//get the request data
	var data = req.body;
	//if there is no id in the request data then return a fail
	if (!data.symptomId || !data.illnessIds) {
		message.success = false;
		message.error = "Bad or missing parameters";
		res.json(message);
	} else {

		//put the data into vars.
		var symptomId = data.symptomId;
		var illnessIds = data.illnessIds;

		//link the symptom to the illnesses
		Relations.linkIllnessesToSymptom(symptomId, illnessIds,
			function (err, successfulEntries, unsuccessfulEntries, duplicateEntries) {

				if (err) {
					console.log(err);
					message.error = err;
					message.success = false;
				} else {
					message.success = true;
				}
				message.successfulEntries = successfulEntries;
				message.unsuccessfulEntries = unsuccessfulEntries;
				message.duplicateEntries = duplicateEntries;
				res.json(message);
			}
		);
	}
});


router.delete('/illness/:illnessId/symptom/:symptomId', function (req, res) {
	console.log("DELETE @ /illness/:illnessId/symptom/:symptomId");
	var message = {};
	var data = req.params;

	var symptomId = data.symptomId;
	var illnessId = data.illnessId;

	if (!symptomId || !illnessId) {
		message.success = false;
		message.error = "Bad or missing parameters";
		res.json(message);
	} else {

		Relations.deleteIllnessSymptomRelation(illnessId, symptomId, function (err, result) {
			console.log("delete relation callback");
			if (err || !result) {
				console.log("error or bad result");
				console.log(err);
				message.error = err;
				message.success = false;
			} else {
				message.success = true;
			}
			res.json(message);

		});
	}
});


///////////////////////////////////////////////////////////////////
/*                   Symptom 1-many Categories					 */
///////////////////////////////////////////////////////////////////


/**
 ROUTE: GET @ ---/allIllnessesFromSymptom/:id
 PURPOSE: to retreive and return a list of ever symptom that is linked to an illness identified by id.
 REQUEST VALUES: id: identier of the illness to grab related symptoms
 */
router.get('/allCategoriesFromSymptom/:id', function (req, res) {
	var message = {};
	//get the request data
	var data = req.params;

	//check if id was included. if not kill it
	if (!data.id) {
		message.error = "Missing Illness id";
		message.success = false;
		res.json(message);
	} else {
		//get the illnesses linked ot the symptom by id
		Relations.getCategoriesLinkedToSymptom(data.id,
			function (err, categories) {
				//check for errors
				if (err) {
					message.success = false;
					message.error = err;
					console.log(err);
				} else {
					message.success = true;
					var formattedCategories = [];
					for (var i = 0; i < categories.length; i++) {
						formattedCategories[i] = {
							category: categories[i].getData()
						}
					}
					message.categories = formattedCategories;
				}

				//send back the success result as well as related symptoms
				res.json(message);
			});
	}
});


//export all of the routes that have been defined
module.exports = router;