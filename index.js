//import dependencies
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
require('./config/passport')(passport);

//initialize server
const app = express();

//configure the database

const db = require('./config/keys').MongoURI;
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log('mongodb connected...'))
  .catch(err => console.log('Database error:' + err));
  
//set ejs view engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

//initialize bodypraser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.urlencoded({ extended: false }));

//session middleware
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

//Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//initialize flash
app.use(flash());
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//set method override
app.use(methodOverride('_method'))
app.use(methodOverride('X-HTTP-Method-Override'))

//Set Static Directories
app.use('/css', express.static('css'));
app.use('/images', express.static('images'));
app.use('/controllers', express.static('controllers'));
//Serve Smart Contracts
app.use('/', express.static('build/contracts'));
app.use('/', express.static('node_modules/truffle-contract/dist'));
//Import Routes
app.use('/', require('./routes/routes'));

//start the server on port 3000
app.listen(3000);
