/**
 * Created by Cam on 7/8/16.
 */



/**
 FILE:  category.js (controller)
 PURPOSE: to serve requests to the server regarding categories.
 FUNCTIONS:
 - create a new category >/
 - update a category     >/
 - get all category      >/
 - get category by id    >/
 */


//import the necessary dependancies
var express = require('express'),
	router = express.Router(),
	auth = require('../middlewares/authenticator'),
	Category = require('../models/category'),
	Schema = require('../schemas');




router.get('/', function (req, res) {

	Category.getAll(function (err, categories) {
		var message = {};
		if (err) {
			message.success = false;
			message.error = err;
		} else {
			message.success = true;
			message.categories = [];
			for (var i = 0; i < categories.length; i++) {
				message.categories[i] = {
					category: categories[i].getData()
				}
			}
		}
		res.json(message);
	});
});


router.get('/:id', function (req, res) {
	var message = {};
	var id = req.params.id;

	if (!id) {
		message.success = false;
		message.error = "bad id passed"
		res.json(message);

	} else {
		Category.getById(id, function (err, category) {
			if (err) {
				message.success = false;
				message.error = err;
			} else {
				if (!category) {
					message.success = false;
					message.error = "No categories by id: " + id
				} else {
					message.success = true;
					message.category = category.getData();
				}
			}
			res.json(message);
		});
	}
});


router.post('/', function (req, res) {

	var message = {};
	console.log(req.body);
	var data = req.body.category;

	var dataInfo = Schema.validateDataWithSchema(data, Schema.category);
	if (!dataInfo.valid) {
		message.error = "Bad request data. Missing parameters.";
		message.missingProperty = dataInfo.missingProperty;
		message.success = false;
		res.json(message);
	} else {
		var category = new Category(data);
		category.save(function (err) {
			console.log("save category callback");
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







router.put('/', function (req, res) {

	var message = {};
	console.log(req.body);
	var data = req.body.category;

	var dataInfo = Schema.validateDataWithSchema(data);
	if (!dataInfo.valid) {
		message.error = "Bad request data. Missing parameters.";
		message.missingProperty = dataInfo.missingProperty;
		message.success = false;
		res.json(message);
	} else {
		var category = new Category(data);
		category.update(function (err) {
			console.log("save category callback");
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



module.exports = router;