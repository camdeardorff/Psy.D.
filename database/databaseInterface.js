/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysql = require('mysql');
var settings = require('../config/dbSettings');



var db = function () {
	this.connection = null;
};

db.getConnection = function () {
	console.log(db);
    if (db.connection) {
		return db.connection;
    } else {
        this.connection = mysql.createConnection(settings);

	    this.connection.connect(function(err){
            if(!err) {
                console.log('Database is connected!');
            } else {
                console.log('Error connecting database!');
            }
        });
	    this.connection.on('error', function (err) {
		    console.log('db error', err);
		    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
			    console.log("PROTOCOL_CONNECTION_LOST TRUE");
				db.connection = null;
			    setTimeout(db.getConnection, 2000);
		    } else {
			    console.log("PROTOCOL_CONNECTION_LOST TRUE");
			    throw err;
		    }
	    })
    }
    return this.connection;
}

db.getConnection();



module.exports = db;