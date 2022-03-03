// config/passport.js

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');

// serialize & deserialize User
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findOne({_id:id}, function(err, user) {
    done(err, user);
  });
});

// local strategy
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'user_id',
      passwordField : 'password',
      passReqToCallback : true
    },
    function(req, user_id, password, done) {
      User.findOne({user_id:user_id})
        .select({password:1})
        .exec(function(err, user) {
          if (err) return done(err);

          if (user && user.authenticate(password)){
            return done(null, user);
          }
          else {
            req.flash('user_id', user_id);
            req.flash('errors', {login:'아이디 또는 비밀번호가 틀렸습니다.'});
            return done(null, false);
          }
        });
    }
  )
);

module.exports = passport;
