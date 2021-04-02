//import dependencies
const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

//Import user model
const User = require('../models/user');

//display login page
router.get('/login', (req, res) => res.render('login'));

//display register page
router.get('/register', (req, res) => res.render('register'));

//display home page
router.get('/home', ensureAuthenticated, function (req, res) {
  res.render('home');
});

//display scan page
router.get('/scan', ensureAuthenticated, function (req, res) {
  //if the user is not verified
  if(req.user.verified == false) {
    //redirect to the home page
    res.redirect('/home');
  } else {
    res.render('scan');
  }
});

//display transfers page
router.get('/transfers', ensureAuthenticated, function (req, res) {
  //if the user is not verified
  if(req.user.verified == false) {
    //redirect to the home page
    res.redirect('/home');
  } else {
    res.render('transfers');
  }
});

//display orders page
router.get('/orders', ensureAuthenticated, function (req, res) {
  //if the user is not verified
  if(req.user.verified == false) {
    //redirect to the home page
    res.redirect('/home');
  } else {
    res.render('orders');
  }
});

//display inventory page
router.get('/inventory', ensureAuthenticated, function (req, res) {
  //if the user is not verified
  if(req.user.verified == false) {
    //redirect to the home page
    res.redirect('/home');
  } else {
    res.render('inventory');
  }
});

//display vehicles page
router.get('/vehicles', ensureAuthenticated, function (req, res) {
  //if the user is not verified
  if(req.user.verified == false) {
    //redirect to the home page
    res.redirect('/home');
  } else {
    res.render('vehicles');
  }
});

//display approve page
router.get('/approve', ensureAuthenticated, function (req, res) {
  //if the user is not verified
  if(req.user.verified == false) {
    //redirect to the home page
    res.redirect('/home');
  }
  //find all users which are not verified
  User.find({verified: false}, function(err, users) {
    if (err) {
      throw err;
    } else {
      res.render('approve',{
        //pass all unverified users to the view
        unverified: users
      });
    }
  });
});

//handle logout request
router.get('/logout', (req, res) => {
  //call logout helper function
  req.logout();
  req.flash('success_msg', 'You are logged out');
  //send the user to the login page
  res.redirect('/login');
});

router.get('/profile', ensureAuthenticated, function (req, res) {
  res.render('profile', {
    //pass the details of the current user to the view
    name: req.user.name,
    email: req.user.email,
    address: req.user.address,
    role: req.user.role,
    organisation: req.user.organisation,
    verified: req.user.verified,
    verified_by: req.user.verified_by
  });
});

//Handle register request
router.post('/register', (req, res) => {
  //store parameters passed from the form
  const { name, email, address, role, organisation, password, password2 } = req.body;
  //store errors
  let errors = [];
  //check for errors
  if (!name || !email ||!address || !role || !organisation || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }
  //if there are errors re-render the page
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      address,
      role,
      organisation,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      //if the user already exists re-render the page
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          address,
          role,
          organisation,
          password,
          password2
        });
      } else {
        //create the new user
        const verified = false;
        const newUser = new User({name,email,address,role,
          organisation,password,verified,});
        //encrypt the password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //set encrypted password
            newUser.password = hash;
            //save the new user
            newUser.save()
              .then(user => {
                //redirect to login page with success messages
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

//Handle login request
router.post('/login', (req, res, next) => {
  //authenticate login request
  passport.authenticate('local', {
    //upon success redirect to home
    successRedirect: '/home',
    //upon failure redirect to login with errors
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});


//Handle approve user request
router.put('/approve/:user', function(req,res) {
  //retrieve route parameter
  var name = req.params.user;
  //get the current user
  User.findOne({ name: name }).then(user => {
    //update the user
    user.verified = true;
    user.markModified("verified");
    user.save().then(res.redirect(303, '/approve'))
    .catch(err => console.log(error));
  })
});

//export the routes for use in other files
module.exports = router;
