'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkUpdate('user', { extra: '{"visible_attributes": ["username", "description", "website", "identity_attributes", "image", "gravatar"]}' }, { extra: null });
  },

  down: (queryInterface, Sequelize) => {
      return Promise.resolve();
  }
};
