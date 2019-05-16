$(document).ready(function() {
  var typingTimerMembers;
  var doneTypingInterval = 500;

  // Send requests to server to obtain organization names and show in available members column
  $('#authorize_user')
    .find('#available_update_owners_users')
    .bind('keyup input', function(e) {
      var input = $(this).val();
      clearTimeout(typingTimerMembers);
      typingTimerMembers = setTimeout(function() {
        available_users(
          input,
          'table_row_available_user_template',
          'available_members'
        );
      }, doneTypingInterval);
    });

  function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var members = [];
  var org_name = $('#detailOrganization')
    .find('h3.name')
    .contents()
    .get(0)
    .nodeValue.trim();
  var members_column = $('#authorize_user').find('.members');

  // Pop up with a form to authorize new users to the application
  $('#members__action_manage_members').click(function() {
    var organization_id = window.location.pathname.split('/').pop();
    var url = '/idm/organizations/' + organization_id + '/edit/members';

    $.get(url, function(data) {
      if (data.type) {
        exit_authorize_users();
        create_message(data.error.type, data.error.text);
        $('#authorize_user').modal('toggle');
      } else {
        for (var i = 0; i < data.members.length; i++) {
          var user = data.members[i].user_id;
          var role = data.members[i].role;
          if (
            members.some(elem => elem.user_id === data.members[i].user_id) ===
            false
          ) {
            var org_role_user_row = $(
              '#table_row_org_role_user_template'
            ).html();
            org_role_user_row = org_role_user_row.replace(
              /username/g,
              htmlEntities(data.members[i].username)
            );
            org_role_user_row = org_role_user_row.replace(
              /user_id/g,
              String(data.members[i].user_id)
            );
            org_role_user_row = org_role_user_row.replace(
              /user_avatar/g,
              String(data.members[i].image)
            );
            org_role_user_row = org_role_user_row.replace(
              /role_id/g,
              String(data.members[i].role)
            );
            org_role_user_row = org_role_user_row.replace(
              /organization_name/g,
              htmlEntities(org_name)
            );
            if (data.members[i].role === 'owner') {
              members_column.prepend(org_role_user_row);
            } else {
              members_column.append(org_role_user_row);
            }
            members_column
              .find('#' + user)
              .find('#' + role)
              .addClass('active');
            members.push({
              user_id: data.members[i].user_id,
              role: data.members[i].role,
            });
          }
        }
      }
    });
  });

  // Exit from form to authorize users to the application
  $('#authorize_user')
    .find('.cancel, .close')
    .click(function() {
      exit_authorize_users();
    });

  // Assign roles to users
  $('#authorize_user')
    .find('.members')
    .on('click', '.role_dropdown_role', function(event) {
      // Stop linking
      event.stopPropagation();

      var role = String($(this).attr('id'));
      var user_id = $(this)
        .closest('.list-group-item')
        .attr('id');
      var username = $(this)
        .closest('.list-group-item')
        .find('.name')
        .html();
      var roles_display = $(this)
        .closest('.list-group-item')
        .find('.roles_display');

      var index_user = members.map(elem => elem.user_id).indexOf(user_id);
      // Remove role from user
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this)
          .closest('.role_options')
          .addClass('not_assigned');
        members.splice(index_user, 1);
        roles_display.html('Not assigned');
        // Add role to user
      } else {
        $(this)
          .siblings()
          .removeClass('active');
        $(this).addClass('active');
        $(this)
          .closest('.role_options')
          .removeClass('not_assigned');
        roles_display.html(role);

        if (index_user < 0) {
          members.push({ user_id: user_id, role: role });
        } else {
          members[index_user] = { user_id: user_id, role: role };
        }
      }
    });

  // Move scroll
  $('#authorized_users').on('click', '.dropdown', function(event) {
    var offset = $(this).offset();
    offset.left -= 20;
    offset.top -= 20;
    $('#update_owners_users_members_scroll').animate({
      scrollTop: offset.top,
      scrollLeft: offset.left,
    });
  });

  // Remove authorized member
  $('#authorized_users').on('click', '.remove', function(event) {
    // Stop linking
    event.preventDefault();

    // item of list
    row = $(this).parent();

    // Id and name of user
    var user_id = row.parent().attr('id');
    var username = row.find('.name').html();

    members = members.filter(function(elem) {
      return elem.user_id != user_id;
    });

    var info_added_user =
      "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-success'>User " +
      username +
      ' removed from application</span>';
    $('#authorize_user')
      .find('#info_added_user')
      .replaceWith(info_added_user);
    $('#authorize_user')
      .find('#info_added_user')
      .fadeIn(800)
      .delay(300)
      .fadeOut(800);
    row.parent().fadeOut(500, function() {
      row.parent().remove();
    });

    if (
      $('#authorize_user')
        .find('#authorized_users')
        .children().length <= 1
    ) {
      $('#no_update_owners_users_members').show();
    }
  });

  // Change available member to members column
  $('#available_members').on('click', '.active', function(event) {
    // Stop linking
    event.preventDefault();

    // item of list
    row = $(this).parent();

    // Id and name of user
    var user_id = row.parent().attr('id');
    var username = row.find('.name').html();
    var image = row
      .parent()
      .find('.avatar')
      .children('img')
      .first()
      .attr('src');

    if (
      $('#authorize_user')
        .find('ul.update_owners_users_members')
        .find('#' + user_id).length
    ) {
      info_added_user =
        "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-warning'>User " +
        user_id +
        ' has been already added</span>';
      $('#authorize_user')
        .find('#info_added_user')
        .replaceWith(info_added_user);
      $('#authorize_user')
        .find('#info_added_user')
        .fadeIn(800)
        .delay(300)
        .fadeOut(800);
    } else {
      var org_role_user_row = $('#table_row_org_role_user_template').html();
      org_role_user_row = org_role_user_row.replace(/username/g, username);
      org_role_user_row = org_role_user_row.replace(/user_id/g, user_id);
      org_role_user_row = org_role_user_row.replace(/user_avatar/g, image);
      org_role_user_row = org_role_user_row.replace(/role_id/g, 'member');
      org_role_user_row = org_role_user_row.replace(
        /organization_name/g,
        htmlEntities(org_name)
      );
      members_column.append(org_role_user_row);

      members_column
        .find('#' + user_id)
        .find('#member')
        .addClass('active');
      members.push({ user_id: user_id, role: 'member' });

      info_added_user =
        "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-success'>User " +
        username +
        ' added</span>';
      $('#authorize_user')
        .find('#info_added_user')
        .replaceWith(info_added_user);
      $('#authorize_user')
        .find('#info_added_user')
        .fadeIn(800)
        .delay(300)
        .fadeOut(800);
    }
  });

  // Handle the submit button form to submit assignment
  $('#submit_managed_members_form').bind('keypress submit', function(event) {
    // stop form from submitting by pressing enter
    if (event.which == 13) {
      event.preventDefault();
    } else if (event.type == 'submit') {
      // stop form from submitting normally
      event.preventDefault();

      var not_assigned = members_column.find('.not_assigned');
      if (not_assigned.length > 0) {
        $('.alert-warning').show('open');
        not_assigned.addClass('dropdown-empty');
      }

      if (
        not_assigned.length === 0 ||
        $('#authorize_user')
          .find('#submit_button')
          .val() == 'Confirm'
      ) {
        // get the action attribute from the <form action=""> element
        var $form = $(this),
          url = $form.attr('action');

        // Change value of hidden input
        $('#authorize_user')
          .find('#submit_members')
          .val(JSON.stringify(members));

        // Continue with the submit request
        $('#submit_managed_members_form')[0].submit();
      } else {
        $('#authorize_user')
          .find('#submit_button')
          .val('Confirm');
      }
    }
  });

  // To remove message
  $('#container.container-fluid').on('click', '#close_message', function() {
    $('.messages').empty();
  });

  // Function to exit from dialog
  function exit_authorize_users() {
    members = [];

    $('#authorize_user')
      .find('#alert_error_search_available')
      .hide('close');
    $('#authorize_user')
      .find('.alert-warning')
      .hide('close');
    $('#authorize_user')
      .find('.modal-footer')
      .find('#submit_button')
      .val('Save');
    $('#authorize_user')
      .find('#no_available_update_owners_users')
      .hide('close');
    $('#authorize_user')
      .find('#perform_filter_available_update_owners_users')
      .show('open');
    $('#authorize_user')
      .find('#available_update_owners_users')
      .val('');
    $('#authorize_user')
      .find('.available_members')
      .empty();
    $('#authorize_user')
      .find('.members')
      .empty();
    $('#authorize_user')
      .find('#update_owners_users_members')
      .val('');
  }

  // Function to create messages
  function create_message(type, text) {
    var message = $('#message_template').html();
    message = message.replace(/type/g, type);
    message = message.replace(/data/g, text);
    $('.messages').replaceWith(message);
  }
});
