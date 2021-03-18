const models = require('../models/models.js');
const config_service = require('../lib/configService.js');
const config = config_service.get_config();
const external_auth = config.external_auth_ldap;

// LDAP library, documented at http://ldapjs.org/client.html
const ldap = require('ldapjs');

const debug = require('debug')('idm:external_auth_ldap');

// MW to see if user is registered
exports.authenticate = function (username, password, callback) {
  debug('--> authenticating external user');

  // Search the user
  const client = ldap.createClient({
    url: 'ldap://' + external_auth.database.host + ':' + external_auth.database.port
  });

  client.bind(external_auth.database.reader_dn, external_auth.database.reader_password, function (err) {
    if (err) {
      debug('--> ERROR LDAP', err);
      callback(err);
    }

    const filter = '(uid=' + username + ')';
    const suffix = external_auth.database.suffix;

    client.search(suffix, { filter, scope: 'sub' }, (err, search_result) => {
      const search_list = [];

      if (err) {
        debug('--> ERROR LDAP', err);
        callback(err);
      }

      search_result.on('searchEntry', (entry) => {
        debug('--> Found entry (user): ' + entry);
        search_list.push(entry);
      });

      search_result.on('error', (err) => {
        debug('--> Search failed with ' + err);
        callback(err);
      });

      /* eslint-disable-next-line no-unused-vars */
      search_result.on('end', (return_value) => {
        debug('--> Search results length: ' + search_list.length);

        for (let i = 0; i < search_list.length; i++) {
          debug('--> User DN:' + search_list[i].objectName);
        }

        //debug('--> Search retval:' + retVal);

        if (search_list.length === 1) {
          client.bind(search_list[0].objectName, password, function (err) {
            if (err) {
              debug('--> LDAP Bind with real credential error: ' + err);
              callback(new Error('invalid'));
            } else {
              debug('--> Bind with real credential is a success');
              find_local_user(search_list[0], function (local_user) {
                callback(null, local_user);
              });
            }
          });
        } else if (search_list.length === 0) {
          debug('--> LDAP User not found');
          callback(new Error('user_not_found'));
        } else {
          debug('--> ERROR LDAP No unique user to bind');
          callback(err);
        }
      });
    });
  });
};

function find_local_user(user, callback) {
  const user_id = get_user_attribute(user, external_auth.database.idAttribute);

  debug('--> searching local user with id: ', external_auth.id_prefix + user_id);
  models.user
    .find({
      attributes: [
        'id',
        'username',
        'salt',
        'password',
        'enabled',
        'email',
        'gravatar',
        'image',
        'admin',
        'date_password',
        'starters_tour_ended'
      ],
      where: {
        id: external_auth.id_prefix + user_id
      }
    })
    .then(function (local_user) {
      if (local_user) {
        debug('--> local user already exists', local_user);
        callback(local_user);
      } else {
        debug('--> local user does not exist, creating it');
        create_local_user(user, function (local_user) {
          debug('--> local user created');
          callback(local_user);
        });
      }
    })
    .catch(function (error) {
      callback(error);
    });
}

function create_local_user(user, callback) {
  debug('--> creating local user');

  const user_id = get_user_attribute(user, external_auth.database.idAttribute);
  const username = get_user_attribute(user, external_auth.database.usernameAttribute);
  const user_mail = get_user_attribute(user, external_auth.database.emailAttribute);

  // TODO: update user values if changed in external database

  // Build a row and validate it
  const local_user = models.user.build({
    id: external_auth.id_prefix + user_id,
    username,
    email: user_mail,
    password: 'none',
    date_password: new Date(new Date().getTime()),
    enabled: true
  });

  local_user
    .validate()
    .then(function () {
      // Save the row in the database
      local_user.save().then(function () {
        callback(local_user);
      });
      // If validation fails, send an array with all errors found
    })
    .catch(function (error) {
      debug('--> error creating local user', error);
      callback(error);
    });
}

function get_user_attribute(user, attribute) {
  debug('--> Getting attribute', attribute);
  for (const a of user.attributes) {
    if (a.type === attribute) {
      return a.vals[0];
    }
  }
  return undefined;
}
