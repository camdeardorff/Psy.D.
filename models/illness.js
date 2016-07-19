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
};

//illness data access function
Illness.prototype.getData = function () {
	return this.data;
};

//sanitize data with use of illness schema and lodash
Illness.prototype.sanitize = function (data) {
	//use provided data or use an empty obj (NO NULL)
	data = data || {};
	//use the illness schema
	schema = schemas.illness;
	return _.pick(_.defaults(data, schema), _.keys(schema));
};

/*
	FUNCTION: save
	PURPOSE: create a new entry in the illness table of the database. Uses data that has been sanitized using the illness schema.
	PARAMS: callback: signals the caller to handle the reprocussions but most importantly returns values.
*/
//TODO: save only new/unique illnesses
Illness.prototype.save = function (callback) {
	//make an obj of this illness for forward reference.
	ill = this;
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
	db.query("INSERT INTO `illness` (??) " +
		"VALUES (?);", [cols, vals],
		function (err, result) {
			//hand an error if there is one
			if (err) {
				console.log(err);
				callback(err);
			} else {
				//no error. update this illness' id with the insert id (auto increment)
				ill.data.id = result.insertId;
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
			for (var val in illnessData) {
				console.log("loopty loop");
				console.log(illnessData[val]);
				values.push(val);
				values.push(illnessData[val]);
				inserts += insert + ",";
			}
			values.push(illnessData.id);
			inserts = inserts.slice(0,-1);

//TODO




			console.log(inserts);
			var query = "UPDATE `illness` SET " + inserts + " WHERE `illness`.`id` =  ?;";
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

Illness.prototype.delete = function (callback) {
	var illnessData = this.getData();
	Illness.getById(illnessData.id, function (err, illness) {
		if (err || !illness) {
			console.log(err);
			callback(err || "No such illness with id: " + illnessData.id);
		} else {
			//the illness exists. lets delete it
			var query = "DELETE FROM `illness` WHERE `illness`.`id` = ?"
				var q = db.query(query, illnessData.id, function (err, result) {
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
Illness.getAll = function (callback) {
	//query the database for all illnesses
	db.query("SELECT * FROM `illness`;", function (err, rows, fields) {
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
}


/*
	FUNCTION: get by id
	PURPOSE: gets an illness that corresponds to the id provided
	PARAMS: id: the id of the illness to be returned
			callback: signals the caller to handle the reprocussions but most importantly returns values.
*/

Illness.getById = function (id, callback) {
	//query the database for the illness that relates to the id provided
	db.query("SELECT * FROM `illness` " +
		"WHERE `id` = ?", [id],
		function (err, rows, fields, result) {
			//check for an error
			if (err) {
				//log it out
				console.log(err);
				callback(err)
			} else {
				//no error but there may not have been a matching illness
				if (rows.length > 0) {
					//there was an illness that matched the id. make it into an illness and send it back
					illness = new Illness(rows[0]);
					callback(null, illness);
				} else {
					//there was no matching illness
					callback();
				}
			}
		});
}





module.exports = Illness;