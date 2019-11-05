const socketIO = require('socket.io');

const Session = require('./models/Session');
const Message = require('./models/Message');

function socket(server) {
  const io = socketIO(server);

  io.use(async function(socket, next) {
    const {token} = socket.handshake.query;
    if (!token) return next(new Error('anonymous sessions are not allowed'));

    const s = await Session.findOne({token}).populate('user');
    if (!s) return next(new Error('wrong or expired session token'));

    socket.user = s.user;
    next();
  });

  io.on('connection', function(socket) {
    const user = socket.user;
    socket.on('message', async (msg) => {
      await Message.create({
        user: user.displayName,
        text: msg,
        chat: user._id,
        date: new Date(),
      });
    });
  });

  return io;
}

module.exports = socket;
