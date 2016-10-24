/**
 * Created by Cam on 10/23/16.
 */


//import the necessary dependancies
var express = require('express');
var router = express.Router();

// accept GET requests and respond with diagnose page
router.get('/', function (req, res) {
	res.render("diagnose");
});

module.exports = router;