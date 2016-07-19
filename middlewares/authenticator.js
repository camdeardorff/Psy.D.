/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//user = require('../models/user');

/*
 * --- next ---
 * the param next is a callback function, use it like a return
 * http://stackoverflow.com/questions/5384526/javascript-node-js-next
 */

module.exports = function (req, res, next) {

	/*
	 *  from tutorial... i beleive this is where the jwt parsing will happen 
	 * or user.authenticate 
	 */

	/*if (req.session && req.session.user) {
	  User.get(req.session.user, function(err, user) {
	    if (user) {
	      req.user = user
	    } else {
	      delete req.user
	      delete req.session.user
	    }

	    next()
	  })
	} else {
	  next()
	}*/
};