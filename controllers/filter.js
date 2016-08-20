




var express = require('express'),
	router = express.Router(),
	filter = require('../utilities/filter');

router.post('/', function (req, res) {
	var data = req.body;
	var message = {};

	//get the lists sent from the client
	var categories = data.categories;
	var illnesses = data.illnesses;
	var symptoms = data.symptoms;

	//make boolean indicators telling how to proceed
	var givenCategories = categories.length > 0;
	var givenIllnesses = illnesses.length > 0;
	var givenSymptoms = symptoms.length > 0;


	//put control flow into a task so there arent callback responses to the client in every branch, this way we can let all
	//of these possible cases return their data to one callback and that callback can handle the response to the client
	var determineAndExecuteFilter = function (callback) {
		//check to see if there is anything to filter!
		if (givenCategories || givenIllnesses || givenSymptoms) {

			/* --------------- SIMPLE FILTERS ---------------- */

			//only category selected
			if (givenCategories && !givenIllnesses && !givenSymptoms) {
				filter.illnessesAndSymptomsWith(categories, function (err, illnesses, symptoms) {
					callback(err, null, illnesses, symptoms);
				});
			}
			// only given illnesses
			else if (!givenCategories && givenIllnesses && !givenSymptoms) {
				filter.categoriesAndSymptomsWith(illnesses, function (err, categories, symptoms) {
					callback(err, categories, null, symptoms);
				});
			}
			// only given symptoms
			else if (!givenCategories && !givenIllnesses && givenSymptoms) {
				filter.categoriesAndIllnessesWith(symptoms, function (err, categories, illnesses) {
					callback(err, categories, illnesses, null);
				});
			}

			/* --------------- COMPOUND FILTERS ---------------- */

			// given both categories and illnesses
			else if (givenCategories && givenIllnesses && !givenSymptoms) {
				filter.symptomsWith(categories, illnesses, function (err, symptoms) {
					callback(err, null, null, symptoms);
				});
			}
			// given both cateogries and symptoms
			else if (givenCategories && !givenIllnesses && givenSymptoms) {
				filter.illnessesWith(categories, symptoms, function (err, illnesses) {
					callback(err, null, illnesses, null);
				});
			}
			// given both illnesses and symptoms
			else if (!givenCategories && givenIllnesses && givenSymptoms) {
				filter.categoriesWith(illnesses, symptoms, function (err, categories) {
					callback(err, categories, null, null);
				});
			}

			/* -------------- NO RESULT FILTERS ----------------- */

			else {
				// get nothing. everthing has converged
				callback("There are no results because at least one of every kind has been selected to filter by.");
			}
		} else {
			// nothing was selected, so send back everything we have
			filter.withoutCondition(function (err, categories, illnesses, symptoms) {
				callback(err, categories, illnesses, symptoms);
			});
		}
	};


	determineAndExecuteFilter(function (err, categories, illnesses, symptoms) {
		if (err) {
			message.success = false;
			message.error = err;
		} else {
			message.success = true;
			//add to the message all that apply
			if (categories) {
				message.categories = categories;
			}
			if (illnesses) {
				message.illnesses = illnesses;
			}
			if (symptoms) {
				message.symptoms = symptoms;
			}
		}
		res.json(message);
	});
});


module.exports = router;