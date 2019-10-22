module.exports = function transformResponse(data, key) {
  switch (key) {
    case 'subcategories':
      return [].concat(data).map(({_id, title}) => {
        return {
          id: _id,
          title,
        };
      });

    case 'categories':
      return [].concat(data).map(({_id, title, subcategories}) => {
        return {
          id: _id,
          title,
          subcategories: transformResponse(subcategories, 'subcategories'),
        };
      });

    case 'products':
      return [].concat(data).map((item) => {
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
      });

    case 'product':
      const {_id: id, title, images, category, subcategory, price, description} = data;
      return {
        id,
        title,
        images,
        category,
        subcategory,
        price,
        description,
      };

    default:
      return [];
  };
};
