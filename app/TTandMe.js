var request = require('request');
var refresh = require('passport-oauth2-refresh');

var apiURL = 'https://api.23andme.com/1/demo/';

var checkOrRenewToken = function(user, next) {
  if(user.TwentyThreeandMe.expires > Date.now()) {
    next();
  } else {
    refresh.requestNewAccessToken('oauth2', user.TwentyThreeandMe.refreshToken, {scope: ['basic', 'names', 'family_tree', 'ancestry']},
      function(err, accessToken, refreshToken) {
        if(err){
          console.log('Error refreshing accessToken: ');
          console.log(err);
        } else {
          var expiration = new Date();
          expiration.setDate(expiration.getDate() + 1);
          user.update({$set: {"TwentyThreeandMe.accessToken": accessToken, "TwentyThreeandMe.refreshToken": refreshToken, "TwentyThreeandMe.expires": expiration}}, function(err, user) {
            if(err) {
              console.log('Error setting new accessToken and refreshToken: ' + err);
            } else {
              next();
            }
          });
        }
    });
  }
}

exports.getUser = function(req, res, endpoint) {
  var callback = function() {
    request.get(apiURL + endpoint, {'auth': {'bearer': req.user.TwentyThreeandMe.accessToken}}, function(err, response, body) {
      if(err) {
        console.log("Error getting " + endpoint + ": " + err);
        res.status(500);
      } else {
        body = JSON.parse(body);
        if(endpoint === 'family_members') {
          res.render('family', {data: body, user: req.user});
        } else {
          res.render('api', {data: body, endpoint: endpoint, user: req.user});
        }
      }
    });
  };

  checkOrRenewToken(req.user, callback);
}
