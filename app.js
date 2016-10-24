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


//app.use(require('./middlewares'));
app.use(logger('combined'));
app.use(require('./controllers'));
app.use("/public", express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.set('views', './views');
app.set('view engine', 'pug');


// start the server
var server = app.listen(process.env.PORT || 3000, function () {
	var host = 'localhost';
	var port = server.address().port;
	console.log('App listening at http://%s:%s', host, port);
});

module.exports = app;