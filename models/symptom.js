/*
	FILE: symptom.js (model)
	PURPOSE: to model a symptom and interact with the database by providing a set of functions to interact with the database
	FUNCTIONS: 
		- constructor
		- get data
		- sanitize data
		- save
		- get all
		- get by id
*/

//load in some necessary dependancies
var db = require('../database/databaseInterface');
var schemas = require("../schemas.js");
var _ = require("lodash");

//constructor
function Symptom(data) {
	//set the data to the sanitized version of the data
	this.data = this.sanitize(data);
};

//get the data (accessor function)
Symptom.prototype.getData = function () {
	return this.data;
};

//sanitize the data according to it's schema
Symptom.prototype.sanitize = function (data) {
	//either use the data or an empty obj (no null)
	data = data || {};
	//use the symptom schema
	schema = schemas.symptom;
	return _.pick(_.defaults(data, schema), _.keys(schema));
};

/*
	FUNCTION: save
	PURPOSE: create a new entry in the database for a symptom with the data already included in this object
	PARAMS: callback: signals the caller to handle the reprocussions but most importantly returns values.
*/
Symptom.prototype.save = function (callback) {
	//make a reference to this symptom for future use
	symp = this;
	//create two arrays. one for columns of the symptom table. one for it's values
	var cols = [];
	var vals = [];
	//loop over all of the data in this obj
	for (var col in this.data) {
		//push into their respective arrays
		cols.push(col);
		vals.push(this.data[col])
	}
	//insert into the databse  INSERT INTO `symptom` (`id`, `name`) VALUES (NULL, 'something for this test');
	var query = db.getConnection().query("INSERT INTO `symptom` (??) VALUES (?);", [cols, vals],
		function (err, result) {
			//check for an error
			console.log("symptom save query callback");
			console.log("err: ", err);
			if (err) {
				console.log(err);
				//send the error back
				callback(err);
			} else {
				//set the id of this obj to the auto increment value of this entry
				symp.data.id = result.insertId;
				callback(null);
			}
		});
	console.log(query.sql);
};





Symptom.prototype.update = function (callback) {
	var symptomData = this.getData();
	Symptom.getById(symptomData.id, function (err, symptom) {
		if (err || !symptom) {
			console.log(err);
			callback(err || "No such symptom with id: " + symptomData.id);
		} else {
			//the symptom exists. lets update it's values
			var values = [];
			var inserts = "";
			var insert = "?? = ?";
			for (var val in symptomData) {
				console.log("loopty loop");
				console.log(symptomData[val]);
				values.push(val);
				values.push(symptomData[val]);
				inserts += insert + ",";
			}
			values.push(symptomData.id);
			inserts = inserts.slice(0,-1);



			var query = "UPDATE `symptom` SET " + inserts + " WHERE `symptom`.`id` =  ?;";
			var q = db.getConnection().query(query, values, function (err, result) {
				if (err) {
					console.log(err);
					callback(err);
				} else if (result.affectedRows < 1) {
					callback("There is an Symptom but it wasn't deleted?");
				} else {
					callback();
				}
			});
			console.log(q.sql);
		}
	});
};

Symptom.prototype.delete = function (callback) {
	var symptomData = this.getData();
	Symptom.getById(symptomData.id, function (err, symptom) {
		if (err || !symptom) {
			console.log(err);
			callback(err || "No such Symptom with id: " + symptomData.id);
		} else {
			//the symptom exists. lets delete it
			var query = "DELETE FROM `symptom` WHERE `symptom`.`id` = ?"
			var q = db.getConnection().query(query, symptomData.id, function (err, result) {
				if (err) {
					console.log(err);
					callback(err);
				} else if (result.affectedRows < 1) {
					callback("There is an Symptom but it wasn't deleted?");
				} else {
					callback();
				}
			});
			console.log(q.sql);
		}
	});
};







/**
	FUNCTION: get all
	PURPOSE: to get and retrieve all of the symptoms listed in the databse
	PARAMS: callback: signals the caller to handle the reprocussions but most importantly returns values.
*/
Symptom.getAll = function (callback) {
	//query the databse for the symptoms
	db.getConnection().query("SELECT * FROM `symptom`", function (err, rows) {
		//check for an error
		if (err) {
			//send back the error
			console.log(err);
			callback(err);
		} else {
			//create an array to hold each of the symptoms
			var symptoms = [];
			//loop over each of the rows returned
			for (var i = 0; i < rows.length; i++) {
				//add the symptom to the list of symptoms
				symptoms[i] = new Symptom(rows[i]);
			}
			callback(null, symptoms);
		}
	});
}


/*
	FUNCTION: get by id
	PURPOSE: get a specific symptom from the database determined by an id
	PARAMS: id: the unique identifyer of the symptom in the database
			callback: signals the caller to handle the reprocussions but most importantly returns values.
*/
Symptom.getById = function (id, callback) {
	//query the database for all of the symptoms that match the id
	var query = db.getConnection().query("SELECT * FROM `symptom` " +
		"WHERE `id` = ?", id,
		function (err, rows, fields) {
			//check for an error
			if (err) {
				//log it out
				console.log(err);
				callback(err)
			} else {
				//no error but there may not have been a matching symptom
				if (rows.length > 0) {
					//there was a symptom that matched the id. make it into a symptom and send it back
					symptom = new Symptom(rows[0]);
					callback(null, symptom);
				} else {
					//there was no matching symptom
					callback();
				}
			}
		});
}

module.exports = Symptom;