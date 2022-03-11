var express = require('express');
var router = express.Router();
var User = require('../models/User');

var passport = require('../config/passport');

router.get('/', function(req, res){
  res.redirect('/users/login');
});

router.get('/ranking', function(req, res){
  User.aggregate(
    [
        { "$project": {
            "user_id": 1,
            "solved": 1,
            "score": { "$size": "$solved" }
        }},
        { "$sort": { "score": -1 } },
        { "$limit": 10 }
    ],
    function(err,users) {
      if(err) return res.json(err);
      res.render('users/ranking', {users:users});
    }
  );
});

//register
router.get('/register', function(req, res){
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('users/registerform', {
    user:user,
    errors:errors
  });
});

//post register
router.post('/register', function(req, res){
  User.create(req.body, function(err, user){
    if(err){
      req.flash('user', req.body);
      req.flash('errors', parseError(err));
      return res.redirect('/users/register');
    }
    res.render('users/register_complete');
  });
});

// Login
router.get('/login', function (req,res) {
  var user_id = req.flash('user_id')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('users/loginform', {
    user_id:user_id,
    errors:errors
  });
});

// Post Login
router.post('/login',
  function(req,res,next){
    var errors = {};
    var isValid = true;

    if(!req.body.user_id){
      isValid = false;
      errors.user_id = '아이디가 입력되어야합니다.';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = '비밀번호가 입력되어야합니다.';
    }

    if(isValid){
      next();
    }
    else {
      req.flash('errors',errors);
      res.redirect('/users/login');
    }
  },
  passport.authenticate('local-login', {
    successRedirect : '/quiz',
    failureRedirect : '/users/login'
  }
));

// Logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/quiz');
});

// edit
router.get('/:user_id/edit', function(req, res){
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if(!user){
    User.findOne({user_id:req.params.user_id}, function(err, user){
      if(err) return res.json(err);
      res.render('users/edit', { user_id:req.params.user_id, user:user, errors:errors });
    });
  }
  else {
    res.render('users/edit', { user_id:req.params.user_id, user:user, errors:errors });
  }
});

// update
router.put('/:user_id', function(req, res, next){
  User.findOne({username:req.params.user_id})
  .select('password')
  .exec(function(err, user){
    if(err) return res.json(err);

    // update user object
    user.originalPassword = user.password;
    user.password = req.body.newPassword? req.body.newPassword : user.password;
    for(var p in req.body){
      user[p] = req.body[p];
    }

    // save updated user
    user.save(function(err, user){
      if(err){
        req.flash('user', req.body);
        req.flash('errors', parseError(err));
        return res.redirect('/users/'+req.params.user_id+'/edit');
      }
      res.redirect('/users/'+user.user_id+'/edit');
    });
});
});

module.exports = router;

function parseError(errors){
  var parsed = {};
  if(errors.user_id == 'ValidationError'){
    for(var user_id in errors.errors){
      var validationError = errors.errors[user_id];
      parsed[user_id] = { message:validationError.message };
    }
  }
  else if(errors.code == '11000' && errors.errmsg.indexOf('user_id') > 0) {
    parsed.user_id = { message:'This ID already exists!' };
  }
  else {
    parsed.unhandled = JSON.stringify(errors);
  }
  return parsed;
}
