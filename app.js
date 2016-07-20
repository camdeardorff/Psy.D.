/* 
 * App.js
 * @author: Cam
 * @purpose:  starting point of the application. It loads everything 
 * and it begins serving user requests.
 */

var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var logger = require('morgan');
var Relations = require('./models/relations');
// var cors = require('cors');

//CORS
// app.all('*', function (req, res, next) {
// 	console.log("got ALL");
// 	res.header("Access-Control-Allow-Origin", "*");
// 	res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
// 	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-requested-with");
// 	if ('OPTIONS' === req.method) {
// 		return res.sendStatus(200);
// 	}
// 	next();
// });


app.use("/public", express.static(__dirname + '/public'));




// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
// support encoded
}));
app.use(logger('combined'));


//app.use(require('./middlewares'));
app.use(require('./controllers'));
app.set('views', './views')
app.set('view engine', 'pug');
app.get('/', function (req, res) {
	res.render('index');
});


/*

 {
 "host": "us-cdbr-iron-east-04.cleardb.net",
 "user": "bb759bc3f59a6f",
 "password": "f1e0b8ba",
 "database": "heroku_e5fd7f436e0cac6"
 }


 {
 "host": "localhost",
 "user": "root",
 "password": "root",
 "database": "Psych_MD",
 "port": 8889,
 "socket": "/Applications/MAMP/tmp/mysql/mysql.sock",
 "multipleStatements": true
 }

 */

//
// Relations.getSymptomsLinkedToCategory(1, function (err, symptoms) {
// 	console.log("get symptoms linked to category callback");
// 	console.log("err: ", err);
// 	console.log("symptoms: ", symptoms);
//
// });
//
// Relations.getCategoriesLinkedToSymptom(1, function (err, categories) {
// 	console.log("get categories linked to symptom callback");
// 	console.log("err: ", err);
// 	console.log("categories: ", categories);
// });

// var Category = require('./models/category');
// Category.getAll(function (err, categories) {
// 	console.log(categories);
// });


// Relations.getSymptomsLinkedToCategory(1, function (err, symptoms) {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log(symptoms);
// 	}
// });


// Relations.getCategoriesLinkedToSymptom(1, function (err, categories) {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log(categories);
// 	}
// });


var server = app.listen(process.env.PORT || 3000, function () {
	var host = 'localhost';
	var port = server.address().port;
	console.log('App listening at http://%s:%s', host, port);
});

module.exports = app;