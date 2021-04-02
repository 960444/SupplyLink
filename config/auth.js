module.exports = {
  ensureAuthenticated: function(req, res, next) {
    //check if the user is authenticated
    if (req.isAuthenticated()) {
      //move onto the next middleware function
      return next();
    }
    //if the user is not identified
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/home');
  }
};
