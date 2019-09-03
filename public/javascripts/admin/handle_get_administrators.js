$(document).ready(function() {
  var url = '/idm/admins/administrators/list';
  load_admins(url);

  function load_admins(url, panel) {
    $('#spinner_admins').show('open');
    $.get(url, function(data, status) {
      if (data.admin_users.length > 0) {
        admins_pagination(data.admin_users_number);
        create_user_rows(data.admin_users, $('#admins_content'));
      } else {
        $('#admins_content')
          .find('.alert')
          .show('open');
      }
      $('#spinner_admins').hide('close');
    });
  }

  function create_user_rows(users, table) {
    for (var i = 0; i < users.length; i++) {
      var user_row = $('#user_row_template').html();
      user_row = user_row.replace(/user_id/g, users[i].id);
      user_row = user_row.replace(/user_image/g, users[i].image);
      user_row = user_row.replace(
        /user_username/g,
        htmlEntities(users[i].username)
      );

      table.append(user_row);
    }
  }

  var typingTimerAdmins;
  var doneTypingInterval = 500;

  $('#auth_admins')
    .find('.form-control')
    .bind('keyup input', function(e) {
      $('#spinner_admins').show('open');
      clearTimeout(typingTimerAdmins);
      typingTimerAdmins = setTimeout(send_filter_request, doneTypingInterval);
    });

  function send_filter_request() {
    $.get(
      url +
        '?key=' +
        $('#auth_admins')
          .find('.form-control')
          .val()
          .toUpperCase(),
      function(data, status) {
        $('#admins_content')
          .children('.list-group-item')
          .remove();
        $('#spinner_admins').hide('close');
        if (data.admin_users.length > 0) {
          $('#admins_content')
            .find('.alert')
            .hide();
          admins_pagination(data.admin_users_number);
          create_user_rows(data.admin_users, $('#admins_content'));
        } else {
          $('#auth_admins_pagination_container').empty();
          $('#admins_content')
            .find('.alert')
            .show();
        }
      }
    );
  }

  function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function admins_pagination(max) {
    $('#auth_admins_pagination_container')
      .bootpag({
        total: Math.ceil(max / 5),
        page: 1,
        maxVisible: 5,
        leaps: true,
        firstLastUse: true,
        first: navigation.first,
        last: navigation.last,
        wrapClass: 'pagination',
        activeClass: 'active',
        disabledClass: 'disabled',
        nextClass: 'next',
        prevClass: 'prev',
        lastClass: 'last',
        firstClass: 'first',
      })
      .on('page', function(event, num) {
        $.get(url + '?page=' + num, function(data, status) {
          $('#admins_content')
            .children('.list-group-item')
            .remove();
          create_user_rows(data.admin_users, $('#admins_content'));
          $('#admins_content')
            .find('.alert')
            .hide();
        });
      });
  }
});
