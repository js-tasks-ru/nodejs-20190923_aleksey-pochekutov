const Category = require('../models/Category');
const transformResponse = require('../utils/transformResponse');


module.exports.categoryList = async function categoryList(ctx, next) {
  const categories = await Category.find();

  ctx.body = {categories: transformResponse(categories, 'categories')};
};
