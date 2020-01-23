$(document).ready(function() {
  // Init some values
  usr_change_role(
    '/idm/applications/filtered_user?role=provider',
    $('#user_applications')
      .find('#panel_tabs')
      .find('li:first')
      .find('a:first')
  );

  $('#user_applications')
    .find('.ajax-tabs')
    .on('click', 'li', function() {
      var panel = $(this).find('a:first');

      if (panel.attr('data-loaded') === 'false') {
        $('#user_applications')
          .find('#spinner_panel_tabs')
          .show();

        var url = panel.attr('href');
        usr_change_role(url, panel);

        $('#user_applications')
          .find('#spinner_panel_tabs')
          .hide();
      }
    });

  function usr_change_role(url, panel) {
    $.get(url, function(data, status) {
      var table;

      if (url.includes('provider')) {
        table = $('#user_applications').find('#providing_table_content');
        usr_providing_applications(data.number_applications);
      } else if (url.includes('purchaser')) {
        table = $('#user_applications').find('#purchased_table_content');
        usr_purchased_applications(data.number_applications);
      } else if (url.includes('other')) {
        table = $('#user_applications').find('#authorized_table_content');
        usr_authorized_applications(data.number_applications);
      }

      usr_create_rows(data.applications, table);
      panel.attr('data-loaded', 'true');
    });
  }

  function usr_create_rows(applications, table) {
    if (applications.length > 0) {
      for (var i = 0; i < applications.length; i++) {
        var application_row = $('#application_row_template').html();
        application_row = application_row.replace(
          /application_id/g,
          applications[i].oauth_client_id
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

        table.append(application_row);
      }
    } else {
      table.find('.alert').show();
    }
  }

  function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function usr_providing_applications(max) {
    $('#user_applications')
      .find('#providing_table_pagination_container')
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
        var url = '/idm/applications/filtered_user?role=provider&page=' + num;
        $.get(url, function(data, status) {
          var table = $('#user_applications').find('#providing_table_content');

          table.empty();
          usr_create_rows(data.applications, table);
        });
      });
  }

  function usr_purchased_applications(max) {
    $('#user_applications')
      .find('#purchased_table_pagination_container')
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
        var url = '/idm/applications/filtered_user?role=purchaser&page=' + num;
        $.get(url, function(data, status) {
          var table = $('#user_applications').find('#purchased_table_content');

          table.empty();
          usr_create_rows(data.applications, table);
        });
      });
  }

  function usr_authorized_applications(max) {
    $('#user_applications')
      .find('#authorized_table_pagination_container')
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
        var url = '/idm/applications/filtered_user?role=other&page=' + num;
        $.get(url, function(data, status) {
          var table = $('#user_applications').find('#authorized_table_content');

          table.empty();
          usr_create_rows(data.applications, table);
        });
      });
  }
});
