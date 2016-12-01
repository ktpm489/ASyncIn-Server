const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

const User = require('../models/user');

passport.use(new BasicStrategy((token, password, cb) => {
  return User.findOneAndValidate(token, password)
    .then(user => {
      if (!user) return cb(null, false);

      return cb(null, user);
    })

    .catch(err => cb(err));
}));

module.exports = passport;
