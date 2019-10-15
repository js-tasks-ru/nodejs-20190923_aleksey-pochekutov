const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let requestList = [];


router.get('/subscribe:r?', async (ctx, next) => {
  requestList.push(ctx);
  await new Promise((res, rej) => {});
});

router.post('/publish', async (ctx, next) => {
  const {message} = ctx.request.body;
  if (!message) return ctx.throw(400, 'err');

  ctx.body = 'OK';
  ctx.msg = message;
  next();
});

app.use(router.routes());

app.use(async (ctx, next) => {
  requestList.forEach((item) => {
    item.res.statusCode = 200;
    item.res.end(ctx.msg);
  });
  requestList = [];
});


module.exports = app;
