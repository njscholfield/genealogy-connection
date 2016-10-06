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

app.set('port', process.env.PORT);
app.use(session({ store: new RedisStore({url: process.env.REDIS_URL}), secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(flash());
app.set('view engine', 'ejs');

require('./app/routes.js')(app, passport, TTandMe);

app.listen(app.get('port'), function() {
  console.log('Node app running of port ' + app.get('port'));
});
