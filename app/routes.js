module.exports = function(app, passport, TTandMe) {

  app.get('/', function(req, res) {
    res.render('index', {user: req.user});
  });

  app.get('/register/', function(req, res) {
    res.render('register', { username: req.user, data: {}, error: {}, message: {type: 'text-danger', content: req.flash('signupMessage')} });
  });

  app.post('/register/', passport.authenticate('local-signup', {
    successRedirect: '/profile/',
    failureRedirect: '/register/',
    failureFlash: true
  }));

  app.get('/login/', function(req, res) {
    res.render('login', {message: req.flash('loginMessage'), error: {} });
  });

  app.post('/login/', passport.authenticate('local-login', {
    successRedirect: '/profile/',
    failureRedirect: '/login/',
    failureFlash: true
  }));

  app.get('/resources/', function(req, res) {
    res.render('resources', {user: req.user});
  });

  app.get('/premium/', function(req, res) {
    res.render('comparison', {user: req.user});
  });

  app.get('/auth/23andme/', isLoggedIn, passport.authorize('oauth2', {scope: ['basic', 'names', 'family_tree', 'ancestry']}));

  app.get('/auth/23andme/callback/', passport.authorize('oauth2', {failureRedirect: '/'}), function(req, res) {
    res.redirect('/profile/');
  });

  app.get('/auth/23andme/disconnect/', isLoggedIn, function(req, res) {
    req.user.update({$set: {'TwentyThreeandMe.accessToken': "", 'TwentyThreeandMe.refreshToken': "", 'TwentyThreeandMe.expires': undefined}}, function(err, user) {
      if(err) {
        console.log("Error disconnecting 23andMe: " + err)
        req.flash('profileError', 'Error disconnecting 23andMe');
      }
      res.redirect('/profile/');
    });
  })

  app.get('/profile/', isLoggedIn, function(req, res) {
    res.render('profile', {user: req.user, message: req.flash('profileError')});
  });

  app.get('/23andme/:endpoint', connected23andMe, function(req, res) {
    TTandMe.getUser(req, res, req.params.endpoint);
  });

  app.get('/logout/', function(req, res){
    req.logout();
    res.redirect('/');
  });

  function isLoggedIn(req, res, next) {
  	if (req.isAuthenticated()) {
      return next();
    }
    req.flash('loginMessage', 'You must be logged in to view this page!');
  	res.redirect('/login/');
  }

  function connected23andMe(req, res, next) {
    isLoggedIn(req, res, function() {
      if(req.user.TwentyThreeandMe.accessToken) {
        return next();
      }
      req.flash('profileError', 'You must connect your 23andMe account to view this page!');
      res.redirect('/profile/');
    });
  }

}
