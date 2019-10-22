const Product = require('../models/Product');

const mapperProduct = (item) => {
  const {_id: id, title, images, category, subcategory, price, description} = item;
  return {
    id,
    title,
    images,
    category,
    subcategory,
    price,
    description,
  };
};

module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  const {query} = ctx.query;

  if (!query) {
    return ctx.body = {products: []};
  }

  const products = await Product.find({$text: {$search: query}});

  ctx.body = {products: products.map(mapperProduct)};
};
