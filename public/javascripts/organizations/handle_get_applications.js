$(document).ready(function() {
  var url =
    '/idm/organizations/' +
    window.location.pathname.split('/')[3] +
    '/applications';
  load_applications(url);

  function load_applications(url, panel) {
    $('#spinner_applications').show('open');
    $.get(url, function(data, status) {
      if (data.applications.length > 0) {
        applications_pagination(data.applications_number);
        create_applications_row(
          data.applications,
          $('#auth_applications_content')
        );
      } else {
        $('#auth_applications_content')
          .find('.alert')
          .show('open');
      }
      $('#spinner_applications').hide('close');
    });
  }

  function create_applications_row(applications, table) {
    for (var i = 0; i < applications.length; i++) {
      var application_row = $('#application_row_template').html();
      application_row = application_row.replace(
        /application_id/g,
        applications[i].id
      );
      application_row = application_row.replace(
        /application_image/g,
        applications[i].image
      );
      application_row = application_row.replace(
        /application_url/g,
        applications[i].url
      );
      application_row = application_row.replace(
        /application_name/g,
        htmlEntities(applications[i].name)
      );

      table.append(application_row);
    }
  }

  var typingTimerApplications;
  var doneTypingInterval = 500;

  $('#auth_applications')
    .find('.form-control')
    .bind('keyup input', function(e) {
      $('#spinner_applications').show('open');
      clearTimeout(typingTimerApplications);
      typingTimerApplications = setTimeout(
        send_filter_request,
        doneTypingInterval
      );
    });

  function send_filter_request() {
    $.get(
      url +
        '?key=' +
        $('#auth_applications')
          .find('.form-control')
          .val()
          .toUpperCase(),
      function(data, status) {
        $('#auth_applications_content')
          .children('.list-group-item')
          .remove();
        $('#spinner_applications').hide('close');
        if (data.applications.length > 0) {
          $('#auth_applications_content')
            .find('.alert')
            .hide();
          applications_pagination(data.applications_number);
          create_applications_row(
            data.applications,
            $('#auth_applications_content')
          );
        } else {
          $('#auth_applications_pagination_container').empty();
          $('#auth_applications_content')
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

  function applications_pagination(max) {
    $('#auth_applications_pagination_container')
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
          $('#auth_applications_content')
            .children('.list-group-item')
            .remove();
          create_applications_row(
            data.applications,
            $('#auth_applications_content')
          );
          $('#auth_applications_content')
            .find('.alert')
            .hide();
        });
      });
  }
});
