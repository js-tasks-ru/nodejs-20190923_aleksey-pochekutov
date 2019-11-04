const uuid = require('uuid/v4');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');


module.exports.register = async (ctx, next) => {
  const {email, displayName, password} = ctx.request.body;
  if (!email || !displayName || !password) return ctx.throw(400, 'Вы должны ввести все данные');

  const user = User.findOne({email});

  if (user) return ctx.throw(400, {errors: {email: 'Такой email уже существует'}});

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
