$(document).ready(function() {
  var url =
    '/idm/users/' + window.location.pathname.split('/')[3] + '/organizations';
  load_organizations(url);

  function load_organizations(url, panel) {
    $('#spinner_organizations').show('open');
    $.get(url, function(data, status) {
      if (data.organizations.length > 0) {
        organizations_pagination(data.organizations_number);
        create_organization_rows(
          data.organizations,
          $('#auth_organizations_content')
        );
      } else {
        $('#auth_organizations_content')
          .find('.alert')
          .show('open');
      }
      $('#spinner_organizations').hide('close');
    });
  }

  function create_organization_rows(organizations, table) {
    for (var i = 0; i < organizations.length; i++) {
      var organization_row = $('#organization_row_template').html();
      organization_row = organization_row.replace(
        /organization_id/g,
        organizations[i].id
      );
      organization_row = organization_row.replace(
        /organization_image/g,
        organizations[i].image
      );
      organization_row = organization_row.replace(
        /organization_name/g,
        htmlEntities(organizations[i].name)
      );
      organization_row = organization_row.replace(
        /organization_description/g,
        htmlEntities(organizations[i].description)
      );

      table.append(organization_row);
    }
  }

  var typingTimerOrganizations;
  var doneTypingInterval = 500;

  $('#auth_organizations')
    .find('.form-control')
    .bind('keyup input', function(e) {
      $('#spinner_organizations').show('open');
      clearTimeout(typingTimerOrganizations);
      typingTimerOrganizations = setTimeout(
        send_filter_request,
        doneTypingInterval
      );
    });

  function send_filter_request() {
    $.get(
      url +
        '?key=' +
        $('#auth_organizations')
          .find('.form-control')
          .val()
          .toUpperCase(),
      function(data, status) {
        $('#auth_organizations_content')
          .children('.list-group-item')
          .remove();
        $('#spinner_organizations').hide('close');
        if (data.organizations.length > 0) {
          $('#auth_organizations_content')
            .find('.alert')
            .hide();
          organizations_pagination(data.organizations_number);
          create_organization_rows(
            data.organizations,
            $('#auth_organizations_content')
          );
        } else {
          $('#auth_organizations_pagination_container').empty();
          $('#auth_organizations_content')
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

  function organizations_pagination(max) {
    $('#auth_organizations_pagination_container')
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
          $('#auth_organizations_content')
            .children('.list-group-item')
            .remove();
          create_organization_rows(
            data.organizations,
            $('#auth_organizations_content')
          );
          $('#auth_organizations_content')
            .find('.alert')
            .hide();
        });
      });
  }
});
