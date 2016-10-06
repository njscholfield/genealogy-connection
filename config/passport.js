var localStrategy = require('passport-local').Strategy;
var OAuth2Strategy = require('passport-oauth2').Strategy;

var User = require('../app/userModel.js');

module.exports = function(passport, refresh) {
  passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

  passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
  });

  passport.use('local-signup', new localStrategy({
    usernameField: 'inputUsername',
    passwordField: 'newPassword1',
    passReqToCallback: true
  },
    function(req, username, password, done) {
      var data = req.body;
      User.findOne({$or: [{email: data.inputEmail}, {'local.username': username}]}, function(err, user) {
        if(err){
          return done(err);
        }

        if(user) {
          if(user.local.username === username) {
            return done(null, false, req.flash('signupMessage', 'That username has already been taken.'));
          }
          return done(null, false, req.flash('signupMessage', 'That email address is already taken.'));
        } else {
          var newUser = new User();
          newUser.name.first = data.inputFirst;
          newUser.name.last = data.inputLast;
          newUser.email = data.inputEmail;
          newUser.local.username = username;
          newUser.local.password = newUser.generateHash(password);

          newUser.save(function(err) {
            if(err) {
              throw err;
            }
            return done(null, newUser);
          });
        }
      })
    }
  ));

  passport.use('local-login', new localStrategy({
    passReqToCallback: true
  },
    function(req, username, password, done) {
      User.findOne({'local.username': username}, function(err, user) {
        if(err) {
          return done(err);
        }
        if(!user) {
          return done(null, false, req.flash('loginMessage', 'User not found.'));
        }
        if(!user.validPassword(password)) {
          return done(null, false, req.flash('loginMessage', 'Incorrect Password!'));
        }

        return done(null, user);
      });
    }
  ));

  var TTandMeStrategy = new OAuth2Strategy({
      authorizationURL: 'https://api.23andme.com/authorize/',
      tokenURL: 'https://api.23andme.com/token/',
      clientID: process.env.TTCLIENT_ID,
      clientSecret: process.env.TTCLIENT_SECRET,
      callbackURL: 'https://gc.noahscholfield.com/auth/23andme/callback/'
    },
    function(accessToken, refreshToken, profile, done) {
      expiration = new Date();
      expiration.setDate(expiration.getDate() + 1);

      User.update({$set: {'TwentyThreeandMe.accessToken': accessToken, 'TwentyThreeandMe.refreshToken': refreshToken, 'TwentyThreeandMe.expires': expiration }}, function(err, user) {
        if(err) {
          console.log("Error connecting 23andMe: " + err);
          return done(err);
        } else {
          return done(null, User);
        }
      });
    }
  );

  passport.use(TTandMeStrategy);
  refresh.use(TTandMeStrategy);
}
