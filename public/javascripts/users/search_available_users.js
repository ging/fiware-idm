function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function available_users(input, template, append_table) {
  $('#' + append_table).empty();
  $('#perform_filter_available_update_owners_users').hide();
  $('#no_available_update_owners_users').hide();
  if (input.length > 1) {
    var url = '/idm/users/available?key=' + input;
    $('#spinner_update_owners_users').show('open');
    $.get(url, function(data, status) {
      if (data.users.length > 0) {
        create_user_rows(data.users, template, append_table);
      } else {
        $('#no_available_update_owners_users').show();
      }
      $('#spinner_update_owners_users').hide('close');
    });
  } else if (input.length <= 1) {
    $('#perform_filter_available_update_owners_users').show();
  }
}

function create_user_rows(users, template, append_table) {
  for (var i = 0; i < users.length; i++) {
    var user_row = $('#' + template).html();
    user_row = user_row.replace(/user_id/g, users[i].id);
    user_row = user_row.replace(/user_avatar/g, users[i].image);
    user_row = user_row.replace(/username/g, htmlEntities(users[i].username));

    $('#' + append_table).append(user_row);
  }
}
