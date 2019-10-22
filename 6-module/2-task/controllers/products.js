const mongoose = require('mongoose');
const Product = require('../models/Product');
const transformResponse = require('../utils/transformResponse');


module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const {subcategory} = ctx.request.query;
  if (!subcategory) return next();

  const products = await Product.find({subcategory});
  ctx.body = {products: transformResponse(products, 'products')};
};

module.exports.productList = async function productList(ctx, next) {
  const products = await Product.find();
  ctx.body = {products: transformResponse(products, 'products')};
};

module.exports.productById = async function productById(ctx, next) {
  const {id} = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return ctx.throw(400, 'Invalid product id');

  const product = await Product.findById(id);
  if (!product) return ctx.throw(404);

  ctx.body = {product: transformResponse(product, 'product')};
};

