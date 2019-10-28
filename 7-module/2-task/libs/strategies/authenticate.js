const User = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  if (!email) return done(null, false, 'Не указан email');

  const user = await User.findOne({email});

  if (!user) {
    try {
      const newUser = await User.create({email, displayName});
      done(null, newUser);
    } catch (err) {
      done(err);
    }
  } else {
    done(null, user);
  }
};
