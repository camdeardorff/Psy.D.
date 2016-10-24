/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var express = require('express');
var router = express.Router();

router.use('/illness', require('./illness'));
router.use('/symptom', require('./symptom'));
router.use('/relations', require('./relations'));
router.use('/category', require('./category'));
router.use('/filter', require('./filter'));
router.use('/admin', require('./admin'));
router.use('/diagnose', require('./diagnose'));

// accept GET request and respond with the index page
router.get('/', function (req, res) {
	res.render("index");
});

module.exports = router;