const models = require('../../models/models.js');
const debug = require('debug')('idm:web-notify_controller');

const email = require('../../lib/email.js');

// GET /idm/admins/notify -- Render notify view
exports.show_notify = function (req, res) {
  debug('--> notify');

  res.render('admin/notify', {
    errors: {},
    users: [],
    subject: '',
    csrf_token: req.csrfToken()
  });
};

// POST /idm/admins/notify -- Send message with info obtain from body
exports.send_message = function (req, res) {
  debug('--> send_message');

  // Objects of errors to be sent to the view
  const errors = {};

  // If subject field is empty send an error message
  if (!req.body.subject) {
    errors.subject = true;
  }

  // Check which option has been selected by the admin user
  switch (req.body.notify) {
    case 'all_users':
      send_message_all_users(req, res, errors);

      break;
    case 'organization':
      send_message_organization(req, res, errors);

      break;
    case 'users_by_id':
      send_message_users_by_id(req, res, errors);

      break;
    default:
      res.locals.message = { text: ' Invalid option.', type: 'warning' };
      res.render('admin/notify', {
        errors: {},
        users: [],
        subject: '',
        csrf_token: req.csrfToken()
      });
  }
};

// Function to send message to all users
function send_message_all_users(req, res, errors) {
  debug(' --> send_message_all_users');

  if (Object.keys(errors).length > 0) {
    errors.option = 'all_users';
    res.render('admin/notify', {
      errors,
      users: [],
      subject: '',
      csrf_token: req.csrfToken()
    });
  } else {
    // Get all enabled users
    get_all_users()
      .then(function (users) {
        // Map array of users to get emails and join all these emails into a string
        const emails = users.map((elem) => elem.email).join();

        const translation = req.app.locals.translation;

        // Send an email message to the user
        email.send('', req.body.subject, emails, req.body.body, translation);

        req.session.message = {
          text: ' Success sending email.',
          type: 'success'
        };
        res.redirect('/');
      })
      .catch(function (error) {
        debug('  -> error' + error);
        req.session.message = { text: ' Fail sending email.', type: 'danger' };
        res.redirect('/');
      });
  }
}

// Function to send message to users of an organization
function send_message_organization(req, res, errors) {
  debug(' --> send_message_organization');

  const organization = req.body.organization;

  if (organization.length > 0) {
    get_organization(organization)
      .then(function (users) {
        // If users not found send an error message
        if (users.length < 1) {
          errors.not_users_organization = true;
        }

        if (Object.keys(errors).length > 0) {
          errors.option = 'organization';
          res.render('admin/notify', {
            errors,
            users: req.body.user_ids,
            subject: req.body.subject,
            csrf_token: req.csrfToken()
          });
        } else {
          // Map array of users to get emails and join all these emails into a string
          const emails = users.map((elem) => elem.email).join();

          const translation = req.app.locals.translation;

          // Send an email message to the user
          email.send('', req.body.subject, emails, req.body.body, translation);

          req.session.message = {
            text: ' Success sending email.',
            type: 'success'
          };
          res.redirect('/');
        }
      })
      .catch(function (error) {
        debug('  -> error' + error);
        req.session.message = { text: ' Fail sending email.', type: 'danger' };
        res.redirect('/');
      });
  } else {
    errors.option = 'organization';
    errors.not_organization = true;
    res.render('admin/notify', {
      errors,
      users: req.body.user_ids,
      subject: req.body.subject,
      csrf_token: req.csrfToken()
    });
  }
}

// Function to send message to users by their id
function send_message_users_by_id(req, res, errors) {
  debug(' --> send_message_users_by_id');

  const user_ids = req.body.user_ids.split(',');

  // Delete white spaces
  for (let i = 0; i < user_ids.length; i++) {
    // If is an empety element delete
    if (user_ids[i] === '') {
      user_ids.splice(i, 1);
      i--;
    } else {
      user_ids[i] = user_ids[i].trim();
    }
  }

  if (user_ids.length > 0) {
    check_users_by_id(user_ids)
      .then(function (result) {
        // If users not found send an error message
        if (result.users_not_found.length > 0) {
          errors.users_not_found = result.users_not_found;
        }

        if (Object.keys(errors).length > 0) {
          errors.option = 'users_by_id';
          res.render('admin/notify', {
            errors,
            users: req.body.user_ids,
            subject: req.body.subject,
            csrf_token: req.csrfToken()
          });
        } else {
          // Map array of users to get emails and join all these emails into a string
          const emails = result.users.map((elem) => elem.email).join();

          const translation = req.app.locals.translation;

          // Send an email message to the user
          email.send('', req.body.subject, emails, req.body.body, translation);

          req.session.message = {
            text: ' Success sending email.',
            type: 'success'
          };
          res.redirect('/');
        }
      })
      .catch(function (error) {
        debug('  -> error' + error);
        req.session.message = { text: ' Fail sending email.', type: 'danger' };
        res.redirect('/');
      });
  } else {
    errors.option = 'users_by_id';
    errors.not_users = true;
    res.render('admin/notify', {
      errors,
      users: req.body.user_ids,
      subject: req.body.subject,
      csrf_token: req.csrfToken()
    });
  }
}

// Function to gel all emails of users enabled from database
function get_all_users() {
  return models.user
    .findAll({
      where: { enabled: true },
      attributes: ['email']
    })
    .then(function (users) {
      return users;
    })
    .catch(function (error) {
      return Promise.reject(error);
    });
}

// Function to gel all emails of users from a specific organization
function get_organization(organization_id) {
  return models.helpers
    .search_distinct('user_organization', 'user', organization_id, 'organization', '%%', 0, false)
    .then(function (users) {
      return users;
    })
    .catch(function (error) {
      return Promise.reject(error);
    });
}

// Function to check if all ids receive from client are in database
function check_users_by_id(user_ids) {
  return models.user
    .findAll({
      where: { id: user_ids, enabled: true },
      attributes: ['id', 'email']
    })
    .then(function (users) {
      // Check if users requested are in the database
      const users_not_found = user_ids.filter(function (id) {
        return !users.map((elem) => elem.id).includes(id);
      });
      return { users_not_found, users };
    })
    .catch(function (error) {
      return Promise.reject(error);
    });
}
