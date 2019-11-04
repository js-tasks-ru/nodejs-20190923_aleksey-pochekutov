const passport = require('../libs/passport');

module.exports.login = async function login(ctx, next) {
  await passport.authenticate('local', async (err, user, info) => {
    if (err) throw err;

    if (!user) {
      ctx.status = 400;
      ctx.body = {error: info};
      return;
    }

    console.log(user, ' user');
    if (user.verificationToken) return ctx.throw(400, 'подтвердите email');

    const token = await ctx.login(user);

    ctx.body = {token};
  })(ctx, next);
};
