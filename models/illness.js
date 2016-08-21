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

//illness constructor
function Illness(data) {
	//sanitize the data and store it away
	this.data = this.sanitize(data);
}

//illness data access function
Illness.prototype.getData = function () {
	return this.data;
};

//sanitize data with use of illness schema and lo dash
Illness.prototype.sanitize = function (data) {
	//use provided data or use an empty obj (NO NULL)
	data = data || {};
	//use the illness schema
	var schema = schemas.illness;
	return _.pick(_.defaults(data, schema), _.keys(schema));
};

/*
 FUNCTION: save
 PURPOSE: create a new entry in the illness table of the database. Uses data that has been sanitized using the illness schema.
 PARAMS: callback: signals the caller to handle the repercussion but most importantly returns values.
 */
//TODO: save only new/unique illnesses
Illness.prototype.save = function (callback) {
	//make an obj of this illness for forward reference.
	var holdIllness = this;
	//two arrays. one for the columns of the query and another for their new values
	var columns = [];
	var values = [];
	//loop over every data point in the illness data
	for (var column in this.data) {
		//push into their respective arrays
		if (this.data.hasOwnProperty(column)) {
			columns.push(column);
			values.push(this.data[column])
		}
	}

	//create a new entry in the database for this illness
	db.getConnection().query("INSERT INTO `illness` (??) " +
		"VALUES (?);", [columns, values],
		function (err, result) {
			//hand an error if there is one
			if (err) {
				console.log(err);
				callback(err);
			} else {
				//no error. update this illness' id with the insert id (auto increment)
				holdIllness.data.id = result.insertId;
				callback(null, result.insertId);
			}
		});
};


Illness.prototype.update = function (callback) {
	var illnessData = this.getData();
	Illness.getById(illnessData.id, function (err, illness) {
		if (err || !illness) {
			console.log(err);
			callback(err || "No such illness with id: " + illnessData.id);
		} else {
			//the illness exists. lets update it's values
			var values = [];
			var inserts = "";
			var insert = "?? = ?";
			for (var value in illnessData) {
				if (illnessData.hasOwnProperty(value)) {
					console.log(illnessData[value]);
					values.push(value);
					values.push(illnessData[value]);
					inserts += insert + ",";
				}
			}
			values.push(illnessData.id);
			inserts = inserts.slice(0, -1);

//TODO


			console.log(inserts);
			var query = "UPDATE `illness` SET " + inserts + " WHERE `illness`.`id` =  ?;";
			db.getConnection().query(query, values, function (err, result) {
				if (err) {
					console.log(err);
					callback(err);
				} else if (result.affectedRows < 1) {
					callback("There is an illness but it wasn't deleted?");
				} else {
					callback();
				}
			});
		}
	});
};

Illness.prototype.delete = function (callback) {
	var illnessData = this.getData();
	Illness.getById(illnessData.id, function (err, illness) {
		if (err || !illness) {
			console.log(err);
			callback(err || "No such illness with id: " + illnessData.id);
		} else {
			//the illness exists. lets delete it
			var query = "DELETE FROM `illness` WHERE `illness`.`id` = ?";
			db.getConnection().query(query, illnessData.id, function (err, result) {
				if (err) {
					console.log(err);
					callback(err);
				} else if (result.affectedRows < 1) {
					callback("There is an illness but it wasn't deleted?");
				} else {
					callback();
				}
			});
		}
	});
};


/*
 FUNCTION: get all
 PURPOSE: to retrieve all of the illnesses currently in the database
 PARAMS: callback: signals the caller to handle the repercussions but most importantly returns values.
 */
Illness.getAll = function (callback) {
	//query the database for all illnesses
	db.getConnection().query("SELECT * FROM `illness`;", function (err, rows) {
		//check for an error and return one if there is
		if (err) {
			callback(err);
		} else {
			//no error
			var illnesses = [];
			//loop over the rows and create illness obj from them, push into array
			for (var i = 0; i < rows.length; i++) {
				illnesses[i] = new Illness(rows[i]);
			}
			//send back all of the illnesses
			callback(null, illnesses);
		}
	});
};


/*
 FUNCTION: get by id
 PURPOSE: gets an illness that corresponds to the id provided
 PARAMS: id: the id of the illness to be returned
 callback: signals the caller to handle the reprocussions but most importantly returns values.
 */

Illness.getById = function (id, callback) {
	//query the database for the illness that relates to the id provided
	db.getConnection().query("SELECT * FROM `illness` " +
		"WHERE `id` = ?", [id],
		function (err, rows) {
			//check for an error
			if (err) {
				//log it out
				console.log(err);
				callback(err)
			} else {
				//no error but there may not have been a matching illness
				if (rows.length > 0) {
					//there was an illness that matched the id. make it into an illness and send it back
					var illness = new Illness(rows[0]);
					callback(null, illness);
				} else {
					//there was no matching illness
					callback();
				}
			}
		});
};


module.exports = Illness;