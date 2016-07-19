/**
 * Created by Cam on 7/8/16.
 */

/*
 FILE: illness.js (model)
 PURPOSE: to model an illness and interact with the database by providing a set of functions to interact with the database
 FUNCTIONS: 
 - constructor
 - get data
 - sanitize data
 - save
 - get all
 - get by id
 */


//import necessary dependancies
var db = require('../database/databaseInterface');
var schemas = require("../schemas.js");
var _ = require("lodash");

//category constructor
function Category(data) {
	//sanitize the data and store it away
	this.data = this.sanitize(data);
};

//category data access function
Category.prototype.getData = function () {
	return this.data;
};

//sanitize data with use of illness schema and lodash
Category.prototype.sanitize = function (data) {
	//use provided data or use an empty obj (NO NULL)
	data = data || {};
	//use the illness schema
	schema = schemas.category;
	return _.pick(_.defaults(data, schema), _.keys(schema));
};


Category.prototype.save = function (callback) {
	//make an obj of this illness for forward reference.
	cat = this;
	//two arrays. one for the columns of the query and another for thier new values
	var cols = [];
	var vals = [];
	//loop over every data point in the illness data
	for (var col in this.data) {
		//push into their respective arrays
		cols.push(col);
		vals.push(this.data[col])
	}

	//create a new entry in the database for this illness
	var query = db.query("INSERT INTO `category` (??) VALUES (?);", [cols, vals],
		function (err, result) {
			//hand an error if there is one
			if (err) {
				console.log(err);
				callback(err);
			} else {
				//no error. update this illness' id with the insert id (auto increment)
				cat.data.id = result.insertId;
				callback();
			}
		});

	console.log(query.sql);
};



Category.prototype.update = function (callback) {
	var categoryData = this.getData();
	Category.getById(categoryData.id, function (err, category) {
		if (err || !category) {
			console.log(err);
			callback(err || "No such category with id: " + categoryData.id);
		} else {
			//the category exists. lets update it's values
			var values = [];
			var inserts = "";
			var insert = "?? = ?";
			for (var val in categoryData) {
				console.log("loopty loop");
				console.log(categoryData[val]);
				values.push(val);
				values.push(categoryData[val]);
				inserts += insert + ",";
			}
			values.push(categoryData.id);
			inserts = inserts.slice(0,-1);


			var query = "UPDATE `category` SET " + inserts + " WHERE `category`.`id` =  ?;";
			var q = db.query(query, values, function (err, result) {
				if (err) {
					console.log(err);
					callback(err);
				} else if (result.affectedRows < 1) {
					callback("There is an illness but it wasn't deleted?");
				} else {
					callback();
				}
			});
			console.log(q.sql);
		}
	});
};








/*
 FUNCTION: get all
 PURPOSE: to retrieve all of the illnesses currently in the database
 PARAMS: callback: signals the caller to handle the reprocussions but most importantly returns values.
 */
Category.getAll = function (callback) {
	//query the database for all illnesses
	db.query("SELECT * FROM `category`;", function (err, rows, fields) {
		//check for an error and return one if there is
		if (err) {
			callback(err);
		} else {
			//no error
			var categories = [];
			//loop over the rows and create illness obj from them, push into array
			for (var i = 0; i < rows.length; i++) {
				categories[i] = new Category(rows[i]);
			}
			//send back all of the illnesses
			callback(null, categories);
		}
	});
};

Category.getById = function (id, callback) {
	var query = db.query("SELECT * FROM `category` WHERE `category`.`id` = ?", id,
		function (err, rows) {
			if (err) {
				console.log(err);
				callback(err);
				return;
			} else {
				//no err
				if (rows.length > 0) {
					//no error and there is data
					var category = new Category(rows[0]);
					callback(null, category);
				} else {
					//no error and no category
					callback();
				}
			}
		}
	);
};


module.exports = Category;