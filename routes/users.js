var express = require('express');
var router = express.Router();
var User = require('../models/User');

router.get('/', function(req, res){
    res.render('users/loginform');
});

router.get('/register', function(req, res){
    res.render('users/registerform');
});

module.exports = router;
