$(document).ready(function() {
  var url =
    '/idm/applications/' +
    window.location.pathname.split('/')[3] +
    '/authorized_users';
  load_users(url);

  function load_users(url, panel) {
    $('#spinner_auth_users').show('open');
    $.get(url, function(data, status) {
      if (data.users.length > 0) {
        users_pagination(data.users_number);
        create_user_rows(data.users, $('#auth_users_content'));
      } else {
        $('#auth_users_content')
          .find('.alert')
          .show('open');
      }
      $('#spinner_auth_users').hide('close');
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

  var typingTimerUsers;
  var doneTypingInterval = 500;

  $('#auth_users')
    .find('.form-control')
    .bind('keyup input', function(e) {
      $('#spinner_auth_users').show('open');
      clearTimeout(typingTimerUsers);
      typingTimerUsers = setTimeout(send_filter_request, doneTypingInterval);
    });

  function send_filter_request() {
    $.get(
      url +
        '?key=' +
        $('#auth_users')
          .find('.form-control')
          .val()
          .toUpperCase(),
      function(data, status) {
        $('#auth_users_content')
          .children('.list-group-item')
          .remove();
        $('#spinner_auth_users').hide('close');
        if (data.users.length > 0) {
          $('#auth_users_content')
            .find('.alert')
            .hide();
          users_pagination(data.users_number);
          create_user_rows(data.users, $('#auth_users_content'));
        } else {
          $('#auth_users_pagination_container').empty();
          $('#auth_users_content')
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

  function users_pagination(max) {
    $('#auth_users_pagination_container')
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
          $('#auth_users_content')
            .children('.list-group-item')
            .remove();
          create_user_rows(data.users, $('#auth_users_content'));
          $('#auth_users_content')
            .find('.alert')
            .hide();
        });
      });
  }
});
