const Message = require('../models/Message');

const mapMessage = (m) => ({
  date: m.date,
  text: m.text,
  id: m._id,
  user: m.user,
});

module.exports.messageList = async function messages(ctx, next) {
  const list = await Message.find().sort('1').limit(20);
  ctx.body = {messages: list.map(mapMessage)};
};
