// Handle button clicks and asynchronous request to the server in order to create permissions

$(document).ready(function () {
  // Select permission item from list
  $('#update_owners_permissions').on('click', '.list-group-item', function (e) {
    if ($(e.target).hasClass('fa-edit') === false && $(e.target).hasClass('fa-trash-alt') === false) {
      var role = $('#update_owners_roles').find('div.active').attr('id');

      if (!['provider', 'purchaser'].includes(role)) {
        var permission = $(this).attr('data-permission-id');
        if (typeof application.role_permission_assign[role] === 'undefined') {
          application.role_permission_assign[role] = [];
        }

        if ($('[data-permission-id=' + permission + ']').hasClass('active')) {
          index = application.role_permission_assign[role].indexOf(permission);
          if (index > -1) {
            application.role_permission_assign[role].splice(index, 1);
          }
        } else {
          application.role_permission_assign[role].push(permission);
        }
        $('[data-permission-id=' + permission + ']').toggleClass('active');
      }
    }
  });

  $('#permButton').click(function () {
    var action = '/idm/applications/' + application.id + '/edit/permissions/create';
    $('#create_permission_form').attr('action', action);
  });

  // Exit from form to create new permission
  $('#esc_perm_creation').click(function () {
    exit_permission_form();
  });

  function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Handle the submit button from the create  permission
  $('#create_permission_form').submit(function (event) {
    // stop form from submitting normally
    event.preventDefault();

    // get the action attribute from the <form action=""> element
    var $form = $(this),
      url = $form.attr('action');

    var name = $(this).find('#id_name').val();

    var body = {
      name: $(this).find('#id_name').val(),
      description: $(this).find('#id_description').val(),
      resource: $(this).find('#id_resource').val(),
      is_regex: $(this).find('#id_is_regex')[0].checked ? 1 : 0,
      use_authorization_service_header: $(this).find('#id_use_authorization_service_header')[0].checked ? 1 : 0,
      authorization_service_header: $(this).find('#id_authorization_service_header').val(),
      action: $(this).find('#id_action').val(),
      xml: $(this).find('#id_xml').val()
    };

    var method = 'POST';
    if ($(this).attr('action').includes('put')) {
      method = 'PUT';
      url = url.split('?')[0];
    }

    // Send put request
    $.ajax({
      url: url,
      type: method,
      beforeSend: before_send($('#create_permission_form').find('input:hidden[name=_csrf]').val()),
      data: body,
      success: function (result) {
        // See if the result of post data is an error
        if (result.type === 'warning') {
          $('#create_permission_form').find('.help-block.alert.alert-danger').hide('close');
          for (var i = result.text.length - 1; i >= 0; i--) {
            $('#create_permission_form')
              .find('#' + result.text[i].message + '.help-block.alert.alert-danger')
              .show('open');
          }
          return false;
          $('#create_permission_form').find('.help-block.alert.alert-danger').hide('close');
          $('#create_permission_form').find('#error_invalid_inputs.help-block.alert.alert-danger').show('open');
        } else if (result.type === 'danger') {
          // Exit from dialog
          exit_permission_form();
          $('#create_permission').modal('toggle');

          // Add message
          create_message(result.type, result.text);

          // If is not an error, add the permission to the list
        } else {
          if (method === 'POST') {
            // Create new row in permission column
            var permission = $('#table_row_permission_template').html();
            permission = permission.replace('perm_name', htmlEntities(result.permission.name));
            permission = permission.replace('perm_id', String(result.permission.id));
            $('#list_permissions').append(permission);

            // Add to permissions array
            application.permissions.push(result.permission);
          } else if (method === 'PUT') {
            var permission_id = url.split('/')[6];
            application.permissions.forEach(function (element, index) {
              if (element.id == permission_id) {
                application.permissions[index]['name'] = name;
              }
            });

            $('#list_permissions')
              .find('[data-permission-id=' + permission_id + ']')
              .find('#display_name')
              .text(name);
          }

          // Exit from dialog
          exit_permission_form();
          $('#create_permission').modal('toggle');

          // Add message
          create_message(result.message.type, result.message.text);
        }
      }
    });
  });

  // Complete form to edit a permission
  $('#update_owners_permissions').on('click', '.edit_permission', function (event) {
    // stop form from submitting normally
    event.preventDefault();

    var permission_id = $(this).parent().attr('data-permission-id');

    if (['1', '2', '3', '4', '5', '6'].includes(permission_id)) {
      // Add message
      create_message('danger', ' Not valid.');
    } else {
      var url = '/idm/applications/' + application.id + '/edit/permissions/' + permission_id;

      // Send put request
      $.ajax({
        url: url,
        type: 'GET',
        success: function (result) {
          if (result.type === 'danger') {
            // Add message
            create_message(result.type, result.text);
          } else {
            $('#create_permission').modal('toggle');
            var action = url + '/edit?method=put';
            $('#create_permission_form').attr('action', action);
            $('#create_permission_form').find('#id_name').val(result.name);
            $('#create_permission_form').find('#id_description').val(result.description);
            $('#create_permission_form').find('#id_action').val(result.action);
            $('#create_permission_form').find('#id_resource').val(result.resource);
            if (result.is_regex > 0) {
              $('#create_permission_form').find('#id_is_regex')[0].checked = true;
            }
            if (result.use_authorization_service_header > 0) {
              $('#create_permission_form').find('#id_use_authorization_service_header')[0].checked = true;
            }
            $('#create_permission_form')
              .find('#id_authorization_service_header')
              .val(result.authorization_service_header);
            $('#create_permission_form').find('#id_xml').val(result.xml);
          }
        }
      });
    }
  });

  // Form to delete a permission
  $('#update_owners_permissions').on('click', '.delete', function (event) {
    // Stop linking
    event.preventDefault();

    // Change form action
    var permission_id = String($(this).parent().attr('data-permission-id'));
    var app_id = String(application.id);
    var action = '/idm/applications/' + app_id + '/edit/permissions/' + permission_id + '/delete';
    $('#delete_permission_form').attr('action', action);
  });

  // To confirm delete the permission
  $('#delete_permission_form').submit(function (event) {
    // stop form from submitting normally
    event.preventDefault();

    // get the action attribute from the <form action=""> element
    var form = $('#delete_permission_form'),
      url = form.attr('action');

    var permission_id = url.split('/')[6];

    // Send delete request
    $.ajax({
      url: url,
      type: 'DELETE',
      beforeSend: before_send($('input:hidden[name=_csrf]').val()),
      success: function (result) {
        if (result.type === 'success') {
          $('#update_owners_permissions')
            .find('[data-permission-id=' + permission_id + ']')
            .remove();
          delete application.role_permission_assign[permission_id];
          for (var role in application.role_permission_assign) {
            application.role_permission_assign[role] = application.role_permission_assign[role].filter(function (
              permission
            ) {
              return permission !== permission_id;
            });
          }

          application.permissions = application.permissions.filter(function (elem) {
            return elem.id !== permission_id;
          });
          $('#update_owners_permissions').hide('close');
          $('#update_owners_info_message').show('open');
        }

        // Add message
        create_message(result.type, result.text);

        // Exit from dialog
        $('#delete_permission').modal('toggle');
      }
    });
  });
});

// Function to put back the default permission form
function exit_permission_form() {
  // Empty input from role creation form
  var action = '/idm/applications/' + application.id + '/edit/permissions/create';
  $('#create_permission_form').attr('action', action);
  $('#create_permission_form').find('#id_name').val('');
  $('#create_permission_form').find('#id_description').val('');
  $('#create_permission_form').find('#id_action').val('');
  $('#create_permission_form').find('#id_resource').val('');
  $('#create_permission_form').find('#id_xml').val('');

  // Hide error if exist
  $('#create_permission_form').find('.help-block.alert.alert-danger').hide('close');
}

// Function to create messages
function create_message(type, text) {
  var message = $('#message_template').html();
  message = message.replace(/type/g, type);
  message = message.replace(/data/g, text);
  $('.messages').replaceWith(message);
}
