// Handle the authorization of users to be administrators
$(document).ready(function() {
  // Pop up with a form to authorize users to be admin
  $('#members__action_manage_administrators').click(function() {
    var url = '/idm/admins/administrators/list?limit=all';
    $.get(url, function(data) {
      if (data.type === 'error') {
        exit_authorize_users();
        $('#authorize_user').modal('toggle');
      } else {
        var admin_users = data.admin_users;

        if (admin_users.length > 0) {
          for (var i = 0; i < admin_users.length; i++) {
            var assign_role_user_row = $(
              '#table_row_set_admin_row_template'
            ).html();
            assign_role_user_row = assign_role_user_row.replace(
              /username/g,
              htmlEntities(admin_users[i].username)
            );
            assign_role_user_row = assign_role_user_row.replace(
              /user_id/g,
              String(admin_users[i].id)
            );
            assign_role_user_row = assign_role_user_row.replace(
              /user_avatar/g,
              String(admin_users[i].image)
            );
            $('#authorize_user')
              .find('#authorized_users')
              .append(assign_role_user_row);
          }
        } else {
          $('#no_update_owners_users_members').show();
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

  // Filter authorized members
  $('#authorize_user')
    .find('#update_owners_users_members')
    .bind('keyup input', function(e) {
      input = $(this);
      filter = $(this)
        .val()
        .toUpperCase();
      ul = $('#authorize_user').find('.members');
      li = ul.children();

      for (i = 0; i < li.length; i++) {
        span = li[i].querySelectorAll('span.name')[0];
        if (span.innerHTML.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = '';
        } else {
          li[i].style.display = 'none';
        }
      }

      $('#alert_error_search_authorized').hide('close');
      if (
        $('#authorize_user')
          .find('#authorized_users')
          .children(':visible').length == 0
      ) {
        $('#no_update_owners_users_members').show();
      } else {
        $('#no_update_owners_users_members').hide();
      }
    });

  function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

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
        username +
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
      var assign_role_user_row = $('#table_row_set_admin_row_template').html();
      assign_role_user_row = assign_role_user_row.replace(
        /username/g,
        htmlEntities(username)
      );
      assign_role_user_row = assign_role_user_row.replace(
        /user_id/g,
        String(user_id)
      );
      assign_role_user_row = assign_role_user_row.replace(
        /user_avatar/g,
        String(image)
      );
      $('#authorize_user')
        .find('.members')
        .append(assign_role_user_row);

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

  // Remove authorized member
  $('.members').on('click', '.remove', function(event) {
    // Stop linking
    event.preventDefault();

    // item of list
    row = $(this).parent();

    // Id and name of user
    var user_id = row.parent().attr('id');
    var username = row.find('.name').html();

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
  });

  // Handle the submit button form to submit assignment
  $('#submit_authorized_administrators_form').bind('keypress submit', function(
    event
  ) {
    // stop form from submitting by pressing enter
    if (event.which == 13) {
      event.preventDefault();
    } else if (event.type == 'submit') {
      // stop form from submitting normally
      event.preventDefault();
      var user_ids = [];
      $('#authorize_user')
        .find('ul.update_owners_users_members')
        .children()
        .each(function() {
          user_ids.push(this.id);
        });

      $('#submit_authorize').val(JSON.stringify(user_ids));
      $('#submit_authorized_administrators_form')[0].submit();
    }
  });
});

// Function to exit from dialog
function exit_authorize_users() {
  $('#authorize_user')
    .find('#alert_error_search_available')
    .hide();
  $('#authorize_user')
    .find('.alert-warning')
    .hide();
  $('#authorize_user')
    .find('#no_update_owners_users_members')
    .hide();
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
    .find('#authorized_users')
    .empty();
  $('#authorize_user')
    .find('.alert-warning')
    .hide('close');
  $('#authorize_user')
    .find('#update_owners_users_members')
    .val('');
}
