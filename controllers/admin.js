/**
 * Created by Cam on 10/23/16.
 */

//import the necessary dependancies
var express = require('express');
var router = express.Router();

// accept GET requests and respond with the admin page
router.get('/', function (req, res) {
		res.render("admin");
});

module.exports = router;