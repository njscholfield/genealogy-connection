var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var passport = require('passport');
var refresh = require('passport-oauth2-refresh');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var app = express();

require('./config/passport.js')(passport, refresh);
var TTandMe = require('./app/TTandMe.js');

app.use(session({ store: new RedisStore({url: 'redis://127.0.0.1:6379/2'}), secret: 'thisisasecret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(flash());
app.set('view engine', 'ejs');

require('./app/routes.js')(app, passport, TTandMe);

app.listen(5000, function() {
  console.log('Node app running of port 5000');
});
