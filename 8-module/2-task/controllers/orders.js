const Order = require('../models/Order');
const sendMail = require('../libs/sendMail');

const mapOrders = (order) => {
  const {_id: id, user, product, phone, address} = order;
  const {images, _id, title, category, description, subcategory, price} = product;

  return {
    id,
    user,
    product: {
      id: _id,
      title,
      images,
      category,
      subcategory,
      price,
      description,
    },
    phone,
    address,
  };
};

module.exports.checkout = async function checkout(ctx, next) {
  const {product, phone, address} = ctx.request.body;

  await Order.create({
    user: ctx.user._id,
    product,
    phone,
    address,
  });

  const o = await Order.findOne({product}).populate('product');

  await sendMail({
    to: ctx.user.email,
    subject: 'Создание заказа',
    locals: {
      id: o._id,
      product,
    },
    template: 'order-confirmation',
  });

  ctx.body = {order: o._id};
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  const orders = await Order.find({user: ctx.user}).populate('product');
  ctx.body = {orders: orders.map(mapOrders)};
};
