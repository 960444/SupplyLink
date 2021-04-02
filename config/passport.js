//import dependencies
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

//Load User model
const User = require('../models/user');

module.exports = function(passport) {
passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Match user
    User.findOne({
      email: email
    }).then(user => {
      if (!user) {
        //return an error message
        return done(null, false, { message: 'That email is not registered' });
      }
      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          //log in and return the current user
          return done(null, user);
        } else {
          //return an error message
          return done(null, false, { message: 'Password incorrect' });
        }
      });
    });
  })
);

//Serialize
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
};
