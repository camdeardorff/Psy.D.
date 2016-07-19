/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var express = require('express'),
	router = express.Router();

router.use('/illness', require('./illness'));
router.use('/symptom', require('./symptom'));
router.use('/relations', require('./relations'));
router.use('/category', require('./category'));


router.get('/', function (req, res) {
	console.log("Got at /");
	res.render("index");
});

module.exports = router;