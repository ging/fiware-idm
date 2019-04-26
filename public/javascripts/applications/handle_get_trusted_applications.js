var trusted_applications = [];
var trusted_applications_filter = [];

var appTypingTimer;
var appDoneTypingInterval = 500;

$(document).ready(function() {
  var applications_table = $('div#trust_apps_content');

  var url =
    '/idm/applications/' +
    window.location.pathname.split('/')[3] +
    '/trusted_applications';

  load_applications(url);

  function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function load_applications(url, panel) {
    $('div#spinner_trust_apps').show('open');
    $.get(url, function(data, status) {
      trusted_applications = data.applications;
      if (trusted_applications && trusted_applications.length > 0) {
        applications_pagination(trusted_applications.length);
        create_applications_rows(
          trusted_applications.slice(0, 5),
          applications_table
        );
      } else {
        applications_table.find('.alert').show('open');
      }
      $('div#spinner_trust_apps').hide('close');
    });
  }

  function create_applications_rows(applications) {
    applications_table.children('.list-group-item').remove();

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
        /application_name/g,
        htmlEntities(applications[i].name)
      );
      application_row = application_row.replace(
        /application_url/g,
        htmlEntities(applications[i].url)
      );

      applications_table.append(application_row);
    }
  }

  $('div#trust_apps')
    .find('input[name=trust_apps__filter__q]')
    .bind('keyup input', function(e) {
      var filter = $(this).val();
      trusted_applications_filter = [];

      clearTimeout(appTypingTimer);
      appTypingTimer = setTimeout(function() {
        for (var i = 0; i < trusted_applications.length; i++) {
          if (
            trusted_applications[i].name
              .toLowerCase()
              .includes(filter.toLowerCase())
          ) {
            trusted_applications_filter.push(trusted_applications[i]);
          }
        }
        create_applications_rows(trusted_applications_filter.slice(0, 5));
        applications_pagination(trusted_applications_filter.length);
      }, appDoneTypingInterval);
    });

  function applications_pagination(max) {
    $('nav#trust_apps_pagination_container')
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
        var start = num === 1 ? 0 : 5 * (num - 1);
        var end = start + 5;

        if (trusted_applications_filter.length <= 0) {
          create_applications_rows(trusted_applications.slice(start, end));
        } else {
          create_applications_rows(
            trusted_applications_filter.slice(start, end)
          );
        }
      });
  }
});
