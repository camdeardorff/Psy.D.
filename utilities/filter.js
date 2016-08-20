//import necessary modules
var db = require('../database/databaseInterface'),
	async = require("async"),
	Illness = require('../models/illness'),
	Symptom = require('../models/symptom'),
	Category = require('../models/category'),
	Relations = require('./relations');

/**
 * @constructor Filter
 */
function Filter() {
}


/**
 * @function FILTER categoriesAndIllnesses with (params)
 * @description filters out categories and illnesses based on a list of symptoms and return the lists of matching categories
 * and illnesses that correspond to those symptoms
 * @param symptoms list of symptoms to filter by
 * @param callback (err, categories, illness)
 */
Filter.categoriesAndIllnessesWith = function (symptoms, callback) {

	var foundCategories = [];
	var foundIllnesses = [];

	// loop over all of the symptoms to find the corresponding categories and illnesses
	async.forEachLimit(symptoms, 5, function (symptomID, callback) {

		//get all categories and and push them into foundCategories
		var getCat = function (callback) {
			Relations.getCategoriesLinkedToSymptom(symptomID, function (err, categories) {
				if (!err) {
					//add the new categories to the list
					for (var i = 0; i < categories.length; i++) {
						foundCategories.push({
							category: categories[i].getData()
						});
					}
				}
				callback(err);
			})
		};

		//get all illnesses and push them into foundIllnesses
		var getIll = function (callback) {
			Relations.getIllnessesLinkedToSymptom(symptomID, function (err, illnesses) {
				if (!err) {
					//add the new illnesses to the list
					for (var i = 0; i < illnesses.length; i++) {
						foundIllnesses.push({
							illness: illnesses[i].getData()
						});
					}
				}
				callback(err);
			});
		};
		// run in parallel and callback when they are done
		async.parallel([getCat, getIll], function (err) {
			callback(err);
		});
		//once the for each is over
	}, function (err) {
		if (!err) {
			//report back success and newly found
			callback(null, foundCategories.unique(), foundIllnesses.unique());
		} else {
			callback(err);
		}
	});
};


/**
 * @function FILTER illnessesAndSymptoms with (params)
 * @description filters out illnesses and symptoms based on a list of categories and return the lists of matching illnesses
 * and symptoms that correspond to those categories
 * @param categories list of categories to filter by
 * @param callback (err, illnesses, symptoms)
 */
Filter.illnessesAndSymptomsWith = function (categories, callback) {
	var foundIllnesses = [];
	var foundSymptoms = [];

	//loop over all of the categories
	async.forEachLimit(categories, 5, function (categoryID, callback) {
		//get all of the illnesses related to this category
		var getIll = function (callback) {
			Relations.getIllnessesInCategory(categoryID, function (err, illnesses) {
				if (!err) {
					//add new illnesses to list of illnesses
					for (var i = 0; i < illnesses.length; i++) {
						foundIllnesses.push({
							illness: illnesses[i].getData()
						});
					}
				}
				callback(err);
			});
		};

		//get all symptoms related to this category
		var getSymp = function (callback) {
			Relations.getSymptomsLinkedToCategory(categoryID, function (err, symptoms) {
				if (!err) {
					// add new symptoms to list of symmptoms
					for (var i = 0; i < symptoms.length; i++) {
						foundSymptoms.push({
							symptom: symptoms[i].getData()
						});
					}
				}
				callback(err);
			});
		};

		//run tasks in parallel and callback
		async.parallel([getIll, getSymp], function (err) {
			callback(err);
		});
		// once the loop over all of the categories is finished
	}, function (err) {
		if (!err) {
			//report back success and newly found
			callback(null, foundIllnesses.unique(), foundSymptoms.unique());
		} else {
			callback(err);
		}
	});

};


/**
 * @function FILTER categoriesAndSymptoms with (params)
 * @description filters out categories and symptoms based on a list of illness and return the lists of matching categories
 * and symptoms that correspond to those illnesses
 * @param illnesses list of illnesses to filter by
 * @param callback (err, categories, symptoms)
 */
Filter.categoriesAndSymptomsWith = function (illnesses, callback) {

	var foundCategories = [];
	var foundSymptoms = [];

	//loop over each of the illnesses to find corresponding categories and symptoms
	async.forEachLimit(illnesses, 5, function (illnessID, callback) {
		//get the category related to this illness
		var getCat = function (callback) {
			Relations.getCategoryLinkedToIllness(illnessID, function (err, category) {
				if (!err) {
					//push this category onto the found categories
						foundCategories.push({
							category: category.getData()
						});
				}
				callback(err);
			});
		};

		// get all symptoms that this illness has
		var getSymp = function (callback) {
			Relations.getSymptomsLinkedToIllness(illnessID, function (err, symptoms) {
				if (!err) {
					// add symptoms to the list of found symptoms
					for (var i = 0; i < symptoms.length; i++) {
						foundSymptoms.push({
							symptom: symptoms[i].getData()
						});
					}
				}
				callback(err);
			});
		};

		// do tasks in parallel then callback
		async.parallel([getCat, getSymp], function (err) {
			callback(err);
		});

		//once the loop over all of the illnesses is done
	}, function (err) {
		if (!err) {
			//report back success and newly found
			callback(null, foundCategories.unique(), foundSymptoms.unique());
		} else {
			callback(err);

		}
	});
};


/**
 * @function FILTER categories with (params)
 * @description filters categories by a list of illnesses and symptoms
 * @param illnesses []
 * @param symptoms []
 * @param callback (err, categories)
 */
Filter.categoriesWith = function (illnesses, symptoms, callback) {


	var foundCategories = [];

	//get compound search queries
	var getIllnessString = getCompoundQueryString("`illness`.`id`", illnesses.length);
	var getSymptomString = getCompoundQueryString("`symptom`.`id`", symptoms.length);

	//put the query strings all together
	var queryString = "SELECT DISTINCT `category`.* " +
		"FROM `category`, `illness`, `illness_symptoms`, `symptom` " +
		"WHERE `category`.`id` = `illness`.`category` " +
		"AND `illness`.`id` = `illness_symptoms`.`illness_id` " +
		"AND `illness_symptoms`.`symptom_id` = `symptom`.`id` " +
		"AND ( " + getIllnessString + ") " +
		"AND ( " + getSymptomString + ") ";

	//put all of the values together
	var values = illnesses.concat(symptoms);

	//query the database
	var query = db.getConnection().query(queryString, values, function (err, rows) {
		if (err) {
			console.log(err);
			callback(err);
		} else {
			// loop each of the rows returned
			for (var i = 0; i < rows.length; i++) {
				//add the category to the list of category
				foundCategories.push({
					category: new Category(rows[i]).getData()
				});
			}
			callback(null, foundCategories.unique());
		}
	});
	console.log(query.sql);
};


/**
 * @function FILTER illnesses with (params)
 * @description filters illnesses based on a list of categories and symptoms
 * @param categories []
 * @param symptoms []
 * @param callback (err, illnesses)
 */
Filter.illnessesWith = function (categories, symptoms, callback) {

	var foundIllnesses = [];
	//get compound filters
	var getCategoryString = getCompoundQueryString("`category`.`id`", categories.length);
	var getSymptomString = getCompoundQueryString("`symptom`.`id`", symptoms.length);

	//put the query string all together
	var queryString = "SELECT DISTINCT `illness`.* " +
		"FROM `category`, `illness`, `illness_symptoms`, `symptom` " +
		"WHERE `category`.`id` = `illness`.`category` " +
		"AND `illness`.`id` = `illness_symptoms`.`illness_id` " +
		"AND `illness_symptoms`.`symptom_id` = `symptom`.`id` " +
		"AND ( " + getCategoryString + ") " +
		"AND ( " + getSymptomString + ") ";

	//put the values all together
	var values = categories.concat(symptoms);

	//query the database
	var query = db.getConnection().query(queryString, values, function (err, rows) {
		if (err) {
			console.log(err);
			callback(err);
		} else {
			// loop each of the rows returned
			for (var i = 0; i < rows.length; i++) {
				//add the illness to the list of illness
				foundIllnesses.push({
					illness: new Illness(rows[i]).getData()
				});
			}
			callback(null, foundIllnesses.unique());
		}
	});
	console.log(query.sql);
};


/**
 * @function FILTER symptoms with (params)
 * @description filters symptoms based on a list of categories and illnesses
 * @param categories []
 * @param illnesses []
 * @param callback (err, symptoms)
 */
Filter.symptomsWith = function (categories, illnesses, callback) {

	var foundSymptoms = [];

	//get compound query strings
	var getCategoryString = getCompoundQueryString("`category`.`id`", categories.length);
	var getIllnessString = getCompoundQueryString("`illness`.`id`", illnesses.length);

	//put all of the query strings together
	var queryString = "SELECT DISTINCT`symptom`.* " +
		"FROM `category`, `illness`, `illness_symptoms`, `symptom` " +
		"WHERE `category`.`id` = `illness`.`category` " +
		"AND `illness`.`id` = `illness_symptoms`.`illness_id` " +
		"AND `illness_symptoms`.`symptom_id` = `symptom`.`id` " +
		"AND ( " + getCategoryString + ") " +
		"AND ( " + getIllnessString + ") ";

	//put all of the search data in together
	var values = categories.concat(illnesses);

	//query the database
	var query = db.getConnection().query(queryString, values, function (err, rows) {
		if (err) {
			console.log(err);
			callback(err);
		} else {
			// loop each of the rows returned
			for (var i = 0; i < rows.length; i++) {
				//add the symptom to the list of symptoms
				foundSymptoms.push({
					symptom: new Symptom(rows[i]).getData()
				});
			}
			callback(null, foundSymptoms.unique());
		}
	});
	console.log(query.sql);
};


/**
 * @function FILTER without condition
 * @description gets every category, illness, and symptom and sends it back. Without a condition everything matches.
 * @param callback
 */
Filter.withoutCondition = function (callback) {
	var error = null;

	var allCategories = [];
	var allIllnesses = [];
	var allSymptoms = [];

	//get all of the categories in the database
	var getCategories = function (callback) {
		Category.getAll(function (err, categories) {
			if (!err) {
				var formattedCategories = [];
				for (var i = 0; i < categories.length; i++) {
					formattedCategories.push({category: categories[i].getData()});
				}
				allCategories = formattedCategories;
			} else {
				error = err;
			}
			callback();
		});
	};

	//gets all of the illnesses in the database
	var getIllnesses = function (callback) {
		Illness.getAll(function (err, illnesses) {
			//check for and handle errors
			if (!err) {
				var formattedIllnesses = [];
				//loop over each illnesses and prepare it for response
				for (var i = 0; i < illnesses.length; i++) {
					formattedIllnesses.push({illness: illnesses[i].getData()});
				}
				allIllnesses = formattedIllnesses;
			} else {
				error = err;
			}
			callback();
		});
	};

	//gets all of the symptoms in the database
	var getSymptoms = function (callback) {
		Symptom.getAll(function (err, symptoms) {
			//check for and handle errors
			if (!err) {
				//there is no error, send back the data
				var formattedSymptoms = [];
				for (var i = 0; i < symptoms.length; i++) {
					formattedSymptoms[i] = {symptom: symptoms[i].getData()}
				}

				allSymptoms = formattedSymptoms
			} else {
				error = err;
			}
			callback();
		});
	};

	//run all processes in parallel and send back what we find
	async.parallel([getCategories, getIllnesses, getSymptoms], function () {
		callback(error, allCategories, allIllnesses, allSymptoms);
	});
};


/**
 * @function get Compound Query String
 * @description creates a chunk of sql to be used in filtering
 * @param column the column to filter with ex: `illness`.`id`
 * @param count number of columns
 * @returns {string}
 */
function getCompoundQueryString(column, count) {
	var queryString = "";
	for (var i = 0; i < count; i++) {
		if (i == 0) {
			queryString = column + " = ? ";
		} else {
			queryString = queryString + " OR " + column + " = ? ";
		}
	}
	return queryString;
}


/**
 * @function unique
 * @description extension of array. Returns an array of only the unique elements in that array. No repeats.
 * @returns {Array}
 */
Array.prototype.unique = function () {
	'use strict';
	var im = {}, uniq = [];
	for (var i = 0; i < this.length; i++) {
		var type = (this[i]).constructor.name,
		//          ^note: for IE use this[i].constructor!
			val = type + (!/num|str|regex|bool/i.test(type)
					? JSON.stringify(this[i])
					: this[i]);
		if (!(val in im)) {
			uniq.push(this[i]);
		}
		im[val] = 1;
	}
	return uniq;
};


//export this module
module.exports = Filter;