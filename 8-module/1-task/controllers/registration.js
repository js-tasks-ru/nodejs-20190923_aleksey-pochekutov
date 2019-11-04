const uuid = require('uuid/v4');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

function getErrors(errorObj) {
  const {errors} = errorObj;
  const err = Object.create(null);
  const keys = Object.keys(errors);

  keys.forEach((key) => err[key] = errors[key].message);

  return {errors: err};
}


module.exports.register = async (ctx, next) => {
  const {email, displayName, password} = ctx.request.body;
  if (!email || !displayName || !password) return ctx.throw(400, 'Вы должны ввести все данные');

  try {
    const u = await User.create({
      email,
      displayName,
      verificationToken: uuid(),
    });
    await u.setPassword(password);
    await u.save();

    await sendMail({
      template: 'confirmation',
      locals: {token: u.verificationToken},
      to: email,
      subject: 'Подтвердите почту',
    });
    ctx.body = {status: 'ok'};
  } catch (err) {
    if (err.name === 'ValidationError') {
      const error = getErrors(err);
      return ctx.throw(400, JSON.stringify(error));
    }

    return ctx.throw(500);
  }
};

module.exports.confirm = async (ctx, next) => {
  const {verificationToken} = ctx.request.body;

  if (!verificationToken) return ctx.throw(400, 'Empty token');

  const u = await User.findOne({verificationToken});

  if (!u) return ctx.throw(400, 'Ссылка подтверждения недействительна или устарела');

  u.verificationToken = undefined;
  await u.save();

  const token = await ctx.login(u._id);

  ctx.body = {token};
};
