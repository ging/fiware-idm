$(document).ready(function() {
  var url =
    '/idm/organizations/' + window.location.pathname.split('/')[3] + '/members';
  load_members(url);

  function load_members(url, panel) {
    $('#spinner_members').show('open');
    $.get(url, function(data, status) {
      if (data.users.length > 0) {
        members_pagination(data.users_number);
        create_user_rows(data.users, $('#members_content'));
      } else {
        $('#members_content')
          .find('.alert')
          .show('open');
      }
      $('#spinner_members').hide('close');
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

  var typingTimerMembers;
  var doneTypingInterval = 500;

  $('#auth_users')
    .find('.form-control')
    .bind('keyup input', function(e) {
      $('#spinner_members').show('open');
      clearTimeout(typingTimerMembers);
      typingTimerMembers = setTimeout(send_filter_request, doneTypingInterval);
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
        $('#members_content')
          .children('.list-group-item')
          .remove();
        $('#spinner_members').hide('close');
        if (data.users.length > 0) {
          $('#members_content')
            .find('.alert')
            .hide();
          members_pagination(data.users_number);
          create_user_rows(data.users, $('#members_content'));
        } else {
          $('#members_pagination_container').empty();
          $('#members_content')
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

  function members_pagination(max) {
    $('#members_pagination_container')
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
          $('#members_content')
            .children('.list-group-item')
            .remove();
          create_user_rows(data.users, $('#members_content'));
          $('#members_content')
            .find('.alert')
            .hide();
        });
      });
  }
});
