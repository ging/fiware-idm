const models = require('..//models.js');

exports.updateOrCreate = function (model, where, newItem, beforeCreate) {
  // Try to find record using findOne
  return models[model].findOne({ where }).then((item) => {
    if (!item) {
      // Item doesn't exist, so we create it

      // Custom promise to add more data to the record
      // Being saved (optional)
      Promise.resolve(beforeCreate).then(() => models[model].create(newItem).then((item) => ({ item, created: true })));
    }

    // Item already exists, so we update it
    return models[model].update(newItem, { where: where }).then((item) => ({ item, created: false }));
  });
};
