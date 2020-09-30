const fs = require('fs');
const path = require('path');
const gravatar = require('gravatar');
const models = require('../../models/models.js');
const config_service = require('../../lib/configService.js');
const config = config_service.get_config();
const image = require('../../lib/image.js');
const debug = require('debug')('idm:web-list_users_controller');

const email_list = config.email_list_type
  ? fs
      .readFileSync(path.join(__dirname, '../../email_list/' + config.email_list_type + '.txt'))
      .toString('utf-8')
      .split('\n')
  : [];

const email = require('../../lib/email.js');

// GET /idm/admins/list_users -- Render list users
exports.show = function (req, res) {
  debug('--> list_users');

  res.render('admin/users', { csrf_token: req.csrfToken(), errors: [] });
};

// GET /idm/admins/list_users/users -- Send users
exports.index = function (req, res) {
  debug('--> users');

  models.user
    .findAndCountAll({
      attributes: ['id', 'username', 'email', 'description', 'website', 'image', 'gravatar', 'enabled']
    })
    .then(function (data) {
      const users = data.rows;

      users.forEach(function (user) {
        let image = '/img/logos/medium/user.png';
        if (user.gravatar) {
          image = gravatar.url(user.email, { s: 36, r: 'g', d: 'mm' }, { protocol: 'https' });
        } else if (user.image !== 'default') {
          image = '/img/users/' + user.image;
        }
        user.image = image;
      });

      res.send({ users, count: data.count });
    })
    .catch(function (error) {
      debug('Error searching users ' + error);
      const message = { text: ' Unable to search users', type: 'danger' };
      res.send(message);
    });
};

// POST /idm/admins/list_users/users -- Create new user
exports.create = function (req, res) {
  debug('--> create');

  req.body.enabled = req.body.enabled === 'true';
  req.body.send_email = req.body.send_email === 'true';

  if (config.email_list_type && req.body.email) {
    if (config.email_list_type === 'whitelist' && !email_list.includes(req.body.email.split('@')[1])) {
      res.send({ text: ' User creation failed.', type: 'danger' });
    }
    if (config.email_list_type === 'blacklist' && email_list.includes(req.body.email.split('@')[1])) {
      res.send({ text: ' User creation failed.', type: 'danger' });
    }
  }

  // Array of errors to send to the view
  let errors = [];

  // Build a row and validate it
  const user = models.user.build({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password1,
    date_password: new Date(new Date().getTime()),
    description: req.body.description,
    website: req.body.website,
    enabled: !!req.body.enabled,
    extra: {
      visible_attributes: ['username', 'description', 'website', 'identity_attributes', 'image', 'gravatar']
      // tfa: {
      //   enabled: false,
      //   secret: '',
      // },
    }
  });

  // If password(again) is empty push an error into the array
  if (req.body.password2 === '') {
    errors.push({ message: 'password2', type: 'Validation error' });
  }

  user
    .validate()
    .then(function () {
      // If the two password are differents, send an error
      if (req.body.password1 !== req.body.password2) {
        errors.push({ message: 'passwordDifferent' });
        throw new Error('passwordDifferent');
      } else {
        // Save the row in the database
        return user.save();
      }
    })
    .then(function () {
      // Send an email to the user
      if (req.body.send_email) {
        const mail_data = {
          username: user.username,
          email: user.email,
          password: req.body.password1,
          link: config.host
        };

        const translation = req.app.locals.translation;

        // Send an email message to the user
        email.send('user_info', '', user.email, mail_data, translation);
      }

      res.send({
        id: user.id,
        username: user.username,
        email: user.email,
        description: user.description,
        website: user.website,
        image: '/img/logos/medium/user.png',
        gravatar: user.gravatar,
        enabled: user.enabled
      });

      // If validation fails, send an array with all errors found
    })
    .catch(function (error) {
      if (error.message !== 'passwordDifferent') {
        errors = errors.concat(error.errors);
      }
      res.status(400).json({ errors });
    });
};

// PUT /idm/admins/list_users/users/:user_id/user_info -- Edit user info
exports.edit_info = function (req, res) {
  debug('--> edit_info');

  if (config.email_list_type && req.body.email) {
    if (config.email_list_type === 'whitelist' && !email_list.includes(req.body.email.split('@')[1])) {
      res.send({ text: ' User creation failed.', type: 'danger' });
    }
    if (config.email_list_type === 'blacklist' && email_list.includes(req.body.email.split('@')[1])) {
      res.send({ text: ' User creation failed.', type: 'danger' });
    }
  }

  const new_data = {
    username: req.body.username,
    description: req.body.description,
    website: req.body.website
  };

  if (req.body.email !== req.user.email) {
    new_data.email = req.body.email;
  }

  // Build a row and validate it
  const user = models.user.build(new_data);

  // Validate user email and username
  user
    .validate()
    .then(function () {
      return models.user.update(new_data, {
        fields: ['username', 'email', 'description', 'website'],
        where: { id: req.user.id }
      });
    })
    .then(function () {
      res.status(200).json({
        user: {
          id: req.user.id,
          username: user.username,
          email: user.email ? user.email : req.user.email,
          description: user.description,
          website: user.website
        }
      });

      // If validation fails, send an array with all errors found
    })
    .catch(function (error) {
      res.status(400).json({ errors: error.errors });
    });
};

// PUT /idm/admins/list_users/users/:user_id/change_password -- Change password of user
exports.change_password = function (req, res) {
  debug('--> change_password');

  // Array of errors to send to the view
  let errors = [];

  const date_password = new Date(new Date().getTime());

  // Build a row and validate it
  const user = models.user.build({
    password: req.body.password1,
    date_password
  });

  // If password(again) is empty push an error into the array
  if (req.body.password2 === '') {
    errors.push({ message: 'password2', type: 'Validation error' });
  }
  // Validate user email and username
  user
    .validate()
    .then(function () {
      // If the two password are differents, send an error
      if (req.body.password1 !== req.body.password2) {
        errors.push({ message: 'passwordDifferent' });
        throw new Error('passwordDifferent');
      } else {
        return models.user.update(
          {
            password: req.body.password1,
            date_password
          },
          {
            fields: ['password', 'date_password'],
            where: { id: req.user.id }
          }
        );
      }
    })
    .then(function () {
      res.status(200).json('success');
      // If validation fails, send an array with all errors found
    })
    .catch(function (error) {
      if (error.message !== 'passwordDifferent') {
        errors = errors.concat(error.errors);
      }
      res.status(400).json({ errors });
    });
};

// PUT /idm/admins/list_users/users/:user_id/enable -- Enable user
exports.enable = function (req, res) {
  debug('--> enable');

  models.user
    .update(
      { enabled: req.body.enabled === 'true' },
      {
        fields: ['enabled'],
        where: { id: req.user.id }
      }
    )
    .then(function () {
      res.status(200).json('success');
    })
    .catch(function (error) {
      debug('Error: ', error);
      res.status(400).json('fail');
    });
};

// DELETE /idm/admins/list_users/users -- Delete user
exports.delete = function (req, res) {
  debug('--> delete');

  let users_image;

  models.user
    .findAll({
      where: {
        id: req.body.delete_users
      }
    })
    .then(function (users) {
      const users_index = users.length;
      if (users_index > 0) {
        users_image = users.map((user) => 'public/img/users/' + user.image);
        return models.user.destroy({
          where: {
            id: req.body.delete_users
          }
        });
      }
      return res.status(200).json('success');
    })
    .then(function () {
      return image.destroy_several(users_image);
    })
    .then(function () {
      return res.status(200).json('success');
    })
    .catch(function (error) {
      debug('Error: ', error);
      res.status(400).json('fail');
    });
};
