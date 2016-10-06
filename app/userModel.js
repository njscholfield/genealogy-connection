var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');

mongoose.connect('mongodb://localhost/23andme', function(err, res) {
  if(err) {
    console.log('ERROR connecting to mongodb://localhost/23andme: ' + err);
  } else {
    console.log ('Succeeded, connected to: mongodb://localhost/23andme');
  }
});

var userSchema = mongoose.Schema({
    name: {
      first: {type: String, required: true},
      last: {type: String, required: true}
    },
    email: {type: String, required: true, index: {unique: true}},
    role: {type: String, default: "user"},
    local: {
      username: {type: String, required: true, index: {unique: true}},
      password: {type: String, required: true},
    },
    TwentyThreeandMe: {
      accessToken: {type: String},
      refreshToken: {type: String},
      expires: {type: Date}
    }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(12), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
