/*
 FILE: relations.js (model)
 PURPOSE: to provide access to specialized cases that blur the lines between many models. This module is used to grab data about model relations

 FUNCTIONS:
 - constructor
 - getSymptomsLinkedToIllness
 - linkSymptomsToIllness

 - getIllnessesLinkedToSymptom
 - linkIllnessesToSymptom
 */

//import necessary modules
var db = require('../database/databaseInterface'),
	schemas = require("../schemas.js"),
	async = require("async"),
	Illness = require('../models/illness'),
	Symptom = require('../models/symptom'),
	Category = require('../models/category');


//Relations constructor
function Relations() {}


Relations.isUniqueIllnessSymptomRelation = function (illnessId, symptomId, callback) {
	console.log("MODEL: Relations, FUNCTION: isUniqueIllnessSymptomRelation");
	if (!illnessId || !symptomId) {
		var err = "bad illness and/or symptom id(s)";
		callback(err);
	} else {
		db.getConnection().query("SELECT * FROM `illness_symptoms` WHERE `illness_id` = ? AND `symptom_id` = ?", [illnessId, symptomId],
			function (err, rows) {
				if (err) {
					console.log(err);
					callback(err);
				} else {
					callback(null, rows.length < 1);
				}
			});
	}
};


Relations.deleteIllnessSymptomRelation = function (illnessId, symptomId, callback) {
	console.log("MODEL: illnessSymptomRelation, FUNCTION: deleteRelation");
	this.isUniqueIllnessSymptomRelation(illnessId, symptomId,
		function (err, isUnique) {
			if (err) {
				console.log(err, false);
				callback(err);
			} else {
				if (isUnique) {
					//there isn't a relation with that info
					callback(null, false);
				} else {
					//there is a relation. lets delete it
					db.getConnection().query("DELETE FROM `illness_symptoms` WHERE `illness_id` = ? AND `symptom_id` = ?", [illnessId, symptomId],
						function (err, result) {
							if (err) {
								console.log(err);
								callback(err, false);
							} else {
								if (result.affectedRows > 0) {
									callback(null, true);
								} else {
									err = "The relation exists but it wasn't deleted... strange";
									callback(err, false);
								}
							}
						});
				}
			}
		});
};


/**
 FUNCTION: get symptoms linked to illness
 PURPOSE: to get a list of symptoms that have been linked to a particular illness specified by id.
 PARAMS: id: unique identifier of the illness
 majorCallback
 */
Relations.getSymptomsLinkedToIllness = function (id, majorCallback) {
	var illnessFromId = null;
	//list of symptom ids to be found
	// var symptomIds = [];
	//list of symptoms to be found from their ids
	var symptoms = [];

	//get a list of symptom ids from the relation table
	//use the list to grab the actual full symptoms
	//return the list of symptoms
	async.series(
		[
			function (callback) {
				Illness.getById(id, function (err, illness) {
					if (err) {
						console.log(err);
						callback(err, null);
					} else {
						if (illness) {
							illnessFromId = illness;
							callback();
						} else {
							callback("No such illness with id: " + id);
						}
					}
				});
			},


			//GET LIST OF RELATED SYMPTOM IDS
			function (callback) {
				if (!illnessFromId) {
					callback();
					return;
				}
				//query the database for the symptom ids that relate to the illness id
				db.getConnection().query("SELECT DISTINCT `symptom`.* FROM `illness_symptoms`, `symptom` WHERE `illness_id` = ? AND `symptom`.`id` = `illness_symptoms`.`symptom_id`", [id], function (err, rows) {
					//check for an error
					if (err) {
						callback(err);
					} else {
						//loop over ever row
						for (var i = 0; i < rows.length; i++) {
							//push it into the symptom id arr
							symptoms[i] = new Symptom(rows[i]);
						}
						//end this routine nicely
						callback();
					}
				});
			}
		],
		function (err) {
			//series completion
			console.log("series completion with err: " + err);
			majorCallback(err, symptoms);
		}
	); //end async series
}; //end function


/**
 FUNCTION: link symptoms to illness
 PURPOSE: to create entries in the illness_symptoms table. relating an illness and a symptom. Relate many symptoms to one illness
 PARAMS: illnessId: the illness to relate many symptoms with
 symptomIds: the symptoms to relate to an illness
 majorCallback
 */
Relations.linkSymptomsToIllness = function (illnessId, symptomIds, majorCallback) {
	//the illness to link with
	var illnessFromId;
	//arrays to track what links work and failed.
	var successfulEntries = [];
	var unsuccessfulEntries = [];
	var duplicateEntries = [];

	if (symptomIds.length < 1) {
		var err = "No symptoms to relate to illness with id: " + illnessId;
		majorCallback(err);
	} else {

		//run sync
		//get the illness obj from its id
		//loop over every symptom id
		//get the sympt obj from its id
		//link both the illness and symptom

		async.series([
				//get illness obj from id
				function (callback) {
					//use illness static function for getting illnesses from db
					console.log("trying to get illness with id: ", illnessId);
					Illness.getById(illnessId, function (err, illness) {
						//check for and handle errors
						console.log("get id completed with err: " + err);
						if (err || !illness) {
							callback(err || "could not find illness with id: " + illnessId);
						} else {
							//there is no error, send back the data
							console.log("illness found: " + illness);
							illnessFromId = illness;
							callback();
						}
					});

				},
				//do work with the illness obj and the symptom ids provided
				function (callback) {
					console.log("next series item, getting symptoms and adding them");
					//loop over all symptom ids
					//a max of 5 at a time

					//check if the illness was found. if not then return
					if (!illnessFromId) {
						var err = "could not find illness with id: " + illnessId;
						callback(err);
						return;
					}


					async.forEachLimit(symptomIds, 5, function (symptomId, callback) {
							//find symptom using its id.
							//relate

							//use symptom static function for getting symptoms from db
							Symptom.getById(symptomId, function (err, symptom) {
								console.log("got symptom from id");
								//check for and handle errors
								if (err) {
									//there was a mysql query error. log it and be done
									console.log(err);
									callback(err);
								} else if (!symptom) {
									//there was no such symptom but no err
									console.log("no such symptom");
									err = "no such symptom with id: " + symptomId;
									unsuccessfulEntries.push({
										illnessWithId: illnessId,
										symptomWithId: symptomId
									});
									callback(err, symptomId);
								} else {
									Relations.isUniqueIllnessSymptomRelation(illnessId, symptomId,
										function (err, isUnique) {
											if (err) {
												console.log("error in is unique relation callback");
												console.log("error: ", err);
												callback(err);
											} else if (!isUnique) {

												duplicateEntries.push({
													illnessWithId: illnessId,
													symptomWithId: symptomId
												});
												callback();
											} else {
												//no error and a valid symptom
												//relate the illness and symptom
												var queryString = "INSERT INTO `illness_symptoms` (`illness_id`, `symptom_id`) VALUES(?,?);";
												var values = [illnessId, symptomId];
												//query the database
												var query = db.getConnection().query(queryString, values, function (err) {
													if (err) {
														console.log("error in relating query");
														console.log(err);
													} else {
														successfulEntries.push({
															illnessWithId: illnessId,
															symptomWithId: symptomId
														});
													}
													callback(err);
												}); //end relation query
											} //end else case (normal case)
										} //end relation unique check function
									); //end relation unique check
								} //end else (good symptom)
							}); //end get symptom by id
						},
						//runs after the for each is done
						function (err) {
							//end this series
							console.log("finished for each");
							console.log("err: " + err);
							callback(err);
						}
					);
				}
				//this runs after both the illness grab and the sympt grab + link have used their callbacks
			],
			function (err) {
				//end this entire function with 'majorCallback'
				console.log("finished series with err: " + err);
				majorCallback(err, successfulEntries, unsuccessfulEntries, duplicateEntries);
			}
		);
	}
};


/**
 FUNCTION: get illnesses linked to symptom
 PURPOSE: to get a list of illnesses that are linked to a symptom determined by the id that is provided.
 PARAMS: id: unique identifier of the symptom that the illnesses are linked to.
 callback
 */
Relations.getIllnessesLinkedToSymptom = function (id, majorCallback) {
	var symptomFromId;
	//array of illness ids related to the symptom
	// var illnessIds = [];
	//array to illnesses that are found using their id
	var illnesses = [];


	//get every illness id that is related to symptom id given
	//get all of the illnesses that are identified by their id
	//return a list of illnesses related to the symptom
	async.series(
		[
			function (callback) {
				Symptom.getById(id, function (err, symptom) {
					console.log("get by id callback with symptom: ", symptom);
					if (err) {
						console.log(err);
						callback(err, null);
					} else {
						if (symptom) {
							symptomFromId = symptom;
							callback();
						} else {
							console.log("No such symptom with id: ", id);
							callback("No such symptom with id: " + id);
						}
					}
				});


			},
			//GET LIST OF RELATED ILLNESS IDS
			function (callback) {
				if (!symptomFromId) {
					callback();
				} else {

					var queryString = "SELECT DISTINCT `illness`.* FROM `illness`, `illness_symptoms` " +
						"WHERE `illness`.`id` = `illness_symptoms`.`illness_id` " +
						"AND `illness_symptoms`.`symptom_id` = ?";


					//query the database for the illnesses that are related to the symptom id
					db.getConnection().query(queryString, [id], function (err, rows) {
						//if there is an error
						if (err) {
							callback(err);
						} else {
							//loop over all of the rows
							for (var i = 0; i < rows.length; i++) {
								//add to the illness id array every illness id that applies
								illnesses[i] = new Illness(rows[i]);
							}
							//end routine nicely
							callback();
						}
					});

				}
			}
		],
		function (err) {
			//series completion
			console.log("series completion with err: " + err);
			majorCallback(err, illnesses);
		}
	); //END ASYNC SERIES
}; //END FUNCTION


/**
 FUNCTION: link illnesses to symptom
 PURPOSE: to create entries in the illness_symptoms table. relating an illness and a symptom. Relate many illness to one symptom
 PARAMS: symptomId: the symptom to relate many illnesses with
 illnessIds: the illnesses to relate to a symptom
 majorCallback
 */
Relations.linkIllnessesToSymptom = function (symptomId, illnessIds, majorCallback) {
	var symptomFromId;

	//arrays to track what links work and failed.
	var successfulEntries = [];
	var unsuccessfulEntries = [];
	var duplicateEntries = [];

	if (illnessIds.length < 1) {
		var err = "No illnesses to relate to symptom with id: " + symptomId;
		majorCallback(err);
		return;
	}

	//run sync
	//get the symptom obj from its id
	//loop over every illness id
	//get the illness obj from its id
	//link both the illness and symptom

	async.series(
		[ //GET THE SYMPTOM
			function (callback) {
				//get the symptom by the id provided
				Symptom.getById(symptomId, function (err, symptom) {
					//if there is an error send it out
					if (err) {
						callback(err);
					} else {
						//no error. make symptomFromId be the symptom found
						console.log("symptom found: " + symptom);
						symptomFromId = symptom;
						callback();
					}
				});
			}, //LOOP OVER THE ILLNESSES (validate then relate)
			function (callback) {
				console.log("next series. going to get illnesses and link them");

				//check if the symptom that they provided is valid
				if (!symptomFromId) {
					//not valid. kill
					console.log("symptomFromId is null, useless");
					var err = "could not find symptom with id: " + symptomId;
					callback(err);
					return;
				}
				//loop over every illness 
				async.forEachLimit(illnessIds, 5, function (illnessId, callback) {
						//get the illness
						Illness.getById(illnessId, function (err, illness) {
							//if there is an error send it out
							if (err) {
								console.log(err);
								callback(err);
							} else if (!illness) {
								//there was no illness in the database with this id. a failed attempt on this loop
								err = "no such illness with id: " + illnessId;
								unsuccessfulEntries.push({
									illnessWithId: illnessId,
									symptomWithId: symptomId
								});
								callback(err, illnessId);
							} else {

								Relations.isUniqueIllnessSymptomRelation(illnessId, symptomId, function (err, isUnique) {
									if (err) {
										callback(err);
									} else if (!isUnique) {
										duplicateEntries.push({
											illnessWithId: illnessId,
											symptomWithId: symptomId
										});
										callback();
									} else {
										//no error and a valid symptom
										//relate the illness and symptom
										var queryString = "INSERT INTO `illness_symptoms` (`illness_id`, `symptom_id`) VALUES(?,?);";
										var values = [illnessId, symptomId];
										//query the database
										var query = db.getConnection().query(queryString, values, function (err) {
											if (err) {
												console.log("error in relating query");
												console.log(err);
											} else {
												//we have a valid illness and symptom
												successfulEntries.push({
													illnessWithId: illnessId,
													symptomWithId: symptomId
												});
											}
											callback(err);
										}); //end relation query
									}
								});
							}
						});
					},
					//ASYNC FOR EACH. COMPLETION
					function (err) {
						console.log("finished for each");
						console.log("err: " + err);
						callback(err);
					}
				);
			}
		],
		//ASYNC SERIES COMPLETION
		function (err) {
			//end this entire function with 'majorCallback'
			console.log("finished series with err: " + err);
			majorCallback(err, successfulEntries, unsuccessfulEntries, duplicateEntries);
		}
	);
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 FUNCTION: get symptoms linked to category
 PURPOSE: to get a list of symptoms that have been linked to a particular category specified by id.
 PARAMS: id: unique identifier of the category
 majorCallback
 */
Relations.getSymptomsLinkedToCategory = function (id, majorCallback) {
	var categoryFromId = null;
	//list of symptoms to be found from their ids
	var illnessesIdsInCategory = [];
	var symptoms = [];

	//get a list of symptom ids from the relation table
	//use the list to grab the actual full symptoms
	//return the list of symptoms
	async.series(
		[
			function (callback) { //get the category
				Category.getById(id, function (err, category) {
					if (err) {
						console.log(err);
						callback(err, null);
					} else {
						if (category) {
							categoryFromId = category;
							callback();
						} else {
							callback("No such category with id: " + id);
						}
					}
				});
			},
			function (callback) { //get all of the illnesses
				if (!categoryFromId) {
					callback();
				} else {

					//get all of the illnesses in that category

					Relations.getIllnessesInCategory(id, function (err, illnesses) {
						if (err || !illnesses) {
							console.log(err);
							callback(err || "no illnesses in this category");
						} else {
							for (var i = 0; i < illnesses.length; i++) {
								illnessesIdsInCategory[i] = illnesses[i].getData().id;
							}
							callback();
						}
					});
				}
			},
			function (callback) { //get all of the unique symptoms
				if (!illnessesIdsInCategory || illnessesIdsInCategory.length < 1) {
					callback();
				} else {

					var insert = "`illness_symptoms`.`illness_id` = ?";
					var inserts = "";
					for (var i = 0; i < illnessesIdsInCategory.length - 1; i++) {
						inserts += insert + " OR ";
					}
					inserts += insert;

					var queryString = "SELECT DISTINCT `symptom`.* " +
						"FROM `illness_symptoms`, `symptom` " +
						"WHERE `illness_symptoms`.`symptom_id` = `symptom`.`id` " +
						"AND " + inserts;

					db.getConnection().query(queryString, illnessesIdsInCategory, function (err, rows) {
						if (err) {
							console.log(err);
							callback(err);
						} else {
							for (var i = 0; i < rows.length; i++) {
								symptoms[i] = new Symptom(rows[i]);
							}
							callback(null, symptoms);
						}
					});
				}
			}
		],
		function (err) {
			//series completion
			console.log("series completion with err: " + err);
			majorCallback(err, symptoms);
		}
	); //end async series
}; //end function


/**
 FUNCTION: get Categories linked to symptom
 PURPOSE: to get a list of Categories that are linked to a symptom determined by the id that is provided.
 PARAMS: id: unique identifier of the symptom that the Categories are linked to.
 callback
 */
Relations.getCategoriesLinkedToSymptom = function (id, majorCallback) {
	var symptomFromId;
	var illnessIds = [];
	var categories = [];

	//get every illness id that is related to symptom id given
	//get all of the illnesses that are identified by their id
	//return a list of illnesses related to the symptom
	async.series(
		[
			function (callback) {
				Symptom.getById(id, function (err, symptom) {
					console.log("get by id callback with symptom: ", symptom);
					if (err) {
						console.log(err);
						callback(err, null);
					} else {
						if (symptom) {
							symptomFromId = symptom;
							callback();
						} else {
							console.log("No such symptom with id: ", id);
							callback("No such symptom with id: " + id);
						}
					}
				});
			},
			function (callback) { //GET LIST OF ILLNESS IDS
				if (!symptomFromId) {
					callback();
				} else {

					Relations.getIllnessesLinkedToSymptom(id, function (err, illnesses) {
						console.log("get illnesses linked to symptom callback");
						console.log("illnesses: ", illnesses);
						if (err) {

							console.log(err);
							callback(err);
						} else {
							console.log("no err!, loop over illnesses");
							for (var i = 0; i < illnesses.length; i++) {
								console.log("loopty loop");
								illnessIds[i] = illnesses[i].getData().id;
							}
							callback();
						}
					});
				}
			},
			function (callback) { //GET DISTINCT CATEGORIES FROM ILLNESS IDS
				if (illnessIds.length < 0) {
					var err = "No illnesses are linked to this symptom";
					callback(err);
				} else {
					var insert = "`illness`.`id` = ?";
					var inserts = "";

					for (var i = 0; i < illnessIds.length - 1; i++) {
						inserts += insert + " OR ";
					}
					inserts += insert;

					var queryString = "SELECT DISTINCT `category`.* FROM `category`, `illness` " +
						"WHERE `category`.`id` = `illness`.`category` " +
						"AND ( " + inserts + " )";

					db.getConnection().query(queryString, illnessIds,
						function (err, rows) {
							if (err) {
								console.log(err);
								callback(err);
							} else {
								for (var i = 0; i < rows.length; i++) {
									categories[i] = new Category(rows[i]);
								}
								callback();
							}
						}
					);
				}
			}
		],
		function (err) {
			//series completion
			console.log("series completion with err: " + err);
			majorCallback(err, categories);
		}
	); //END ASYNC SERIES
}; //END FUNCTION


Relations.getCategoryLinkedToIllness = function (id, callback) {
	if (id) {
		Illness.getById(id, function (err, illness) {
			if (err || !illness) {
				console.log("err: ", err, "illness: ", illness);
				callback(err || "No such illness from id: " + id, null);
			} else {

				Category.getById(illness.getData().category, function (err, category) {
					if (err || !category) {
						callback(err || "no such category linked to illness")
					} else {
						callback(null, category);
					}
				});
			}
		});
	} else {
		callback("bad illness id");
	}
};


Relations.getIllnessesInCategory = function (id, callback) {
	Category.getById(id, function (err, category) {
		if (err || !category) {
			console.log(err);
			callback(err || "No such category with id: " + id);
		} else {
			//SELECT `illness`.* FROM `category`, `illness` WHERE `category`.`id` = 1 AND `illness`.`category` = 1
			db.getConnection().query("SELECT `illness`.* FROM `category`, `illness` WHERE `category`.`id` = ? AND `illness`.`category` = ?", [id, id],
				function (err, rows) {
					if (err) {
						console.log(err);
						callback(err);
					} else {
						var illnesses = [];
						for (var i = 0; i < rows.length; i++) {
							illnesses[i] = new Illness(rows[i]);
						}
						callback(err, illnesses);
					}
				}
			);
		}
	});
};


module.exports = Relations;