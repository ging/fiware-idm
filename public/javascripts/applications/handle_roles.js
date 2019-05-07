// Handle button clicks and asynchronous request to the server in order to create roles

var application = {
  id: '',
  roles: [],
  permissions: [],
  role_permission_assign: {},
  role_policy_assign: {},
};

$(document).ready(function() {
  var application_id = $('#assign_role_permission_form')
    .attr('action')
    .split('/')[3];

  // Send put request
  $.ajax({
    url: '/idm/applications/' + application_id + '/edit/roles/assignments',
    type: 'GET',
    beforeSend: before_send(
      $('#assign_role_permission_form')
        .find('input:hidden[name=_csrf]')
        .val()
    ),
    success: function(result) {
      if (result.type === 'danger') {
        // Add message
        create_message(result.type, result.text);
      } else {
        application = result.application;
        parse_values(application.roles, application.permissions);
      }
    },
  });

  function parse_values(roles, permissions) {
    // Parse rows in roles column
    for (var i = 0; i < roles.length; i++) {
      var role_row = $('#table_row_role_template').html();
      role_row = role_row.replace(/role_name/g, htmlEntities(roles[i].name));
      role_row = role_row.replace(/role_id/g, roles[i].id);
      role_row = role_row.replace(/app_id/g, application.id);

      if (['provider', 'purchaser'].includes(roles[i].id)) {
        $('#update_owners_roles').prepend(role_row);
        $('#update_owners_roles')
          .find('#' + roles[i].id)
          .children('a')
          .remove();
      } else {
        $('#update_owners_roles').append(role_row);
      }
    }

    // Parse rows in permissions column
    for (var i = 0; i < permissions.length; i++) {
      var permission_row = $('#table_row_permission_template').html();
      permission_row = permission_row.replace(/perm_id/g, permissions[i].id);
      permission_row = permission_row.replace(/app_id/g, application.id);
      permission_row = permission_row.replace(
        /perm_name/g,
        htmlEntities(permissions[i].name)
      );
      if (['1', '2', '3', '4', '5', '6'].includes(permissions[i].id)) {
        $('#list_permissions').prepend(permission_row);
        $('#list_permissions')
          .find('[data-permission-id=' + permissions[i].id + ']')
          .children('span')
          .remove();
        $('#list_permissions')
          .find('[data-permission-id=' + permissions[i].id + ']')
          .children('.edit_permission')
          .remove();
        $('#list_permissions')
          .find('[data-permission-id=' + permissions[i].id + ']')
          .children('.delete')
          .remove();
      } else {
        $('#list_permissions').append(permission_row);
      }
    }
  }

  // Show permissions of a role
  $('#update_owners_roles').on('click', '.btn', function() {
    var role = $(this).attr('id');
    var permission = null;
    for (var i = 0; i < application.permissions.length; i++) {
      permission = application.permissions[i].id;
      if (['provider', 'purchaser'].includes(role)) {
        if (!['1', '2', '3', '4', '5', '6'].includes(permission)) {
          $('[data-permission-id=' + permission + ']').hide();
        } else {
          $('[data-permission-id=' + permission + ']').show();
          if (application.role_permission_assign[role].includes(permission)) {
            $('[data-permission-id=' + permission + ']').addClass('active');
          } else {
            $('[data-permission-id=' + permission + ']').removeClass('active');
          }
        }
      } else {
        $('[data-permission-id=' + permission + ']').show();
        if (typeof application.role_permission_assign[role] === 'undefined') {
          $('[data-permission-id=' + permission + ']').removeClass('active');
        } else {
          if (application.role_permission_assign[role].includes(permission)) {
            $('[data-permission-id=' + permission + ']').addClass('active');
          } else {
            $('[data-permission-id=' + permission + ']').removeClass('active');
          }
        }
      }
    }
    if (['provider', 'purchaser'].includes(role)) {
      $('#list_permissions').addClass('disabled-list');
    } else {
      $('#list_permissions').removeClass('disabled-list');
    }
    $('#update_owners_permissions').show();
    $('#update_owners_info_message').hide();
  });

  // Exit from form to create new roles
  $('#esc_role_creation').click(function() {
    exit_role_form();
  });

  function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Handle the submit button from the create role form
  $('#create_role_form').submit(function(event) {
    // stop form from submitting normally
    event.preventDefault();

    // get the action attribute from the <form action=""> element
    var $form = $(this),
      url = $form.attr('action');

    // Send the data using post with element id name
    var posting = $.post({
      url: url,
      data: {
        name: $('#create_role_form')
          .find('#id_name')
          .val(),
      },
      beforeSend: before_send(
        $('#create_role_form')
          .find('input:hidden[name=_csrf]')
          .val()
      ),
    });

    // Alerts the results
    posting.done(function(result) {
      // See if the result of post is an error
      if (result.type === 'warning') {
        // Show error input empty
        $('#create_role_form')
          .find('.help-block.alert.alert-danger')
          .show('open');
      } else if (result.type === 'danger') {
        // Exit from dialog
        exit_role_form();
        $('#create_role').modal('toggle');

        // Add message
        create_message(result.type, result.text);

        // If is not an error, add the role to the list
      } else {
        // Create new row in role column
        var role_row = $('#table_row_role_template').html();
        role_row = role_row.replace(
          /role_name/g,
          htmlEntities(result.role.name)
        );
        role_row = role_row.replace(/role_id/g, String(result.role.id));
        role_row = role_row.replace(/app_id/g, String(application.id));
        $('#update_owners_roles').append(role_row);

        // Add to roles array
        application.roles.push(result.role);

        // Exit from dialog
        exit_role_form();
        $('#create_role').modal('toggle');

        // Add message
        create_message(result.message.type, result.message.text);
      }
    });
  });

  // To show a little form to edit a role
  $('#update_owners_roles').on('click', '.ajax-inline-edit', function(event) {
    // Stop linking
    event.preventDefault();

    // Load template
    var edit_role = $('#edit_role').html();

    // Edit template with role and applications ids and role name
    var role_name = $(this)
      .parent()
      .find('label')
      .html();
    var role_id = String(
      $(this)
        .attr('href')
        .split('/')[6]
    );
    var app_id = String(application.id);

    edit_role = edit_role.replace(/app_id/g, app_id);
    edit_role = edit_role.replace(/role_id/g, role_id);
    edit_role = edit_role.replace(/role_name/g, htmlEntities(role_name));

    // Replace the row with the template edit_role edited
    $('#update_owners_roles')
      .find('#' + role_id)
      .replaceWith(edit_role);
  });

  // Handle the submit button from the edit role
  $('#update_owners_roles').on('click', '.inline-edit-submit', function(event) {
    // Stop linking
    event.preventDefault();

    // Body parameters of request
    var role_id = String(
      $(this)
        .attr('href')
        .split('/')[6]
    );
    var role_name = $('#update_owners_roles')
      .find('#' + role_id + '.form-control')
      .val();

    // Send put request
    $.ajax({
      url: $(this).attr('href'),
      type: 'PUT',
      beforeSend: before_send(
        $('#assign_role_permission_form')
          .find('input:hidden[name=_csrf]')
          .val()
      ),
      data: { role_name: role_name },
      success: function(result) {
        if (result.type === 'warning') {
          // Show error input empty
          $('#assign_role_permission_form')
            .find('#alert_error')
            .show('open');
        } else if (result.type === 'danger') {
          // Hide error if exists
          $('#assign_role_permission_form')
            .find('#alert_error')
            .hide('close');

          // Add message
          create_message(result.type, result.text);
        } else {
          // Update role name
          var role_row = $('#table_row_role_template').html();
          role_row = role_row.replace(/role_name/g, htmlEntities(role_name));
          role_row = role_row.replace(/role_id/g, role_id);
          role_row = role_row.replace(/app_id/g, String(application.id));
          $('#update_owners_roles')
            .find('#' + role_id)
            .replaceWith(role_row);
          application.roles.forEach(function(element, index) {
            if (element.id == role_id) {
              application.roles[index]['name'] = role_name;
            }
          });

          //Hide error if exists
          $('#assign_role_permission_form')
            .find('#alert_error')
            .hide('close');

          // Add message
          create_message(result.type, result.text);
        }
      },
    });
  });

  // Handle the cancel button from edit role
  $('#update_owners_roles').on('click', '.inline-edit-cancel', function(event) {
    // Stop linking
    event.preventDefault();

    var role_id = $(this)
      .parent()
      .parent()
      .attr('id');

    // Function to find the name of the role
    var role = application.roles.find(function find_role_name(
      role,
      index,
      array
    ) {
      if (role.id === role_id) {
        return role;
      }
    });

    // To return to the previous step
    var role_row = $('#table_row_role_template').html();
    role_row = role_row.replace(/role_name/g, htmlEntities(role.name));
    role_row = role_row.replace(/role_id/g, String(role.id));
    role_row = role_row.replace(/app_id/g, String(application.id));

    $('#assign_role_permission_form')
      .find('#alert_error')
      .hide('close');
    $('#update_owners_roles')
      .find('#' + role_id)
      .replaceWith(role_row);
  });

  // Form to delete a role
  $('#update_owners_roles').on('click', '.delete', function(event) {
    // Stop linking
    event.preventDefault();

    // Change form action
    var role_id = String(
      $(this)
        .parent()
        .attr('id')
    );
    var app_id = String(application.id);
    var action =
      '/idm/applications/' + app_id + '/edit/roles/' + role_id + '/delete';
    $('#delete_role_form').attr('action', action);
  });

  // To confirm delete the role
  $('#delete_role_form').submit(function(event) {
    // stop form from submitting normally
    event.preventDefault();

    // get the action attribute from the <form action=""> element
    var form = $('#delete_role_form'),
      url = form.attr('action');

    var role_id = url.split('/')[6];

    // Send delete request
    $.ajax({
      url: url,
      type: 'DELETE',
      beforeSend: before_send($('input:hidden[name=_csrf]').val()),
      success: function(result) {
        if (result.type === 'success') {
          $('#update_owners_roles')
            .find('#' + role_id)
            .remove();
          delete application.role_permission_assign[role_id];
          application.roles = application.roles.filter(function(elem) {
            return elem.id !== role_id;
          });

          $('#update_owners_permissions').hide('close');
          $('#update_owners_info_message').show('open');
        }

        // Add message
        create_message(result.type, result.text);

        // Exit from dialog
        $('#delete_role').modal('toggle');
      },
    });
  });

  // To remove message
  $('#container.container-fluid').on('click', '#close_message', function() {
    $('.messages').empty();
  });
});

// Function to put back the default role form
function exit_role_form() {
  // Empty input from role creation form
  $('#create_role_form')
    .find('#id_name')
    .val('');

  // Hide error if exist
  $('#create_role_form')
    .find('.help-block.alert.alert-danger')
    .hide('close');
}

// Function to create messages
function create_message(type, text) {
  var message = $('#message_template').html();
  message = message.replace(/type/g, type);
  message = message.replace(/data/g, text);
  $('.messages').replaceWith(message);
}
