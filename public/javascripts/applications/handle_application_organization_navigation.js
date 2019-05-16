$(document).ready(function() {
  // Init some values
  org_change_role(
    '/idm/applications/filtered_organization?role=provider',
    $('#organization_applications')
      .find('#panel_tabs')
      .find('li:first')
      .find('a:first')
  );

  $('#organization_applications')
    .find('.ajax-tabs')
    .on('click', 'li.role', function() {
      var panel = $(this).find('a:first');

      if (panel.attr('data-loaded') === 'false') {
        $('#organization_applications')
          .find('#spinner_panel_tabs')
          .show();

        var url = panel.attr('href');
        org_change_role(url, panel);

        $('#organization_applications')
          .find('#spinner_panel_tabs')
          .hide();
      }
    });

  $('#select_org').on('changed.bs.select', function() {
    $('#organization_applications')
      .find('.alert')
      .hide();
    $('#organization_applications')
      .find('#providing_table_content')
      .empty();
    $('#organization_applications')
      .find('#purchased_table_content')
      .empty();
    $('#organization_applications')
      .find('#authorized_table_content')
      .empty();
    $('#organization_applications')
      .find('[data-target="#panel_tabs_org_providing_tab"]')
      .attr('data-loaded', 'false');
    $('#organization_applications')
      .find('[data-target="#panel_tabs_org_purchased_tab"]')
      .attr('data-loaded', 'false');
    $('#organization_applications')
      .find('[data-target="#panel_tabs_org_authorized_tab"]')
      .attr('data-loaded', 'false');
    $('#organization_applications')
      .find('#panel_tabs')
      .children()
      .removeClass('active');
    $('#organization_applications')
      .find('#panel_tabs')
      .children()
      .first()
      .addClass('active');
    $('#organization_applications')
      .find('.tab-pane')
      .removeClass('active');
    $('#organization_applications')
      .find('#panel_tabs_org_providing_tab')
      .addClass('active');
    org_change_role(
      '/idm/applications/filtered_organization?role=provider',
      $('#organization_applications')
        .find('#panel_tabs')
        .find('li:first')
        .find('a:first')
    );
  });

  function org_change_role(url, panel) {
    var organization_id = $('#select_org').val();
    url = url + '&organization=' + organization_id;

    $.get(url, function(data, status) {
      var table;
      if (url.includes('provider')) {
        table = $('#organization_applications').find(
          '#providing_table_content'
        );
        org_providing_application(data.number_applications);
      } else if (url.includes('purchaser')) {
        table = $('#organization_applications').find(
          '#purchased_table_content'
        );
        org_purchased_applications(data.number_applications);
      } else if (url.includes('other')) {
        table = $('#organization_applications').find(
          '#authorized_table_content'
        );
        org_authorized_applications(data.number_applications);
      }

      org_create_rows(data.applications, table);
      panel.attr('data-loaded', 'true');
    });
  }

  function org_create_rows(applications, table) {
    if (applications.length > 0) {
      table
        .parent()
        .find('.alert')
        .hide();

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
      table
        .parent()
        .find('.alert')
        .show();
    }
  }

  function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function org_providing_application(max) {
    $('#organization_applications')
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
        var url =
          '/idm/applications/filtered_organization?role=provider&page=' + num;
        var organization_id = $('#select_org').val();
        url = url + '&organization=' + organization_id;
        $.get(url, function(data, status) {
          var table = $('#organization_applications').find(
            '#providing_table_content'
          );

          table.empty();
          org_create_rows(data.applications, table);
        });
      });
  }

  function org_purchased_applications(max) {
    $('#organization_applications')
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
        var url =
          '/idm/applications/filtered_organization?role=purchaser&page=' + num;
        var organization_id = $('#select_org').val();
        url = url + '&organization=' + organization_id;
        $.get(url, function(data, status) {
          var table = $('#organization_applications').find(
            '#purchased_table_content'
          );

          table.empty();
          org_create_rows(data.applications, table);
        });
      });
  }

  function org_authorized_applications(max) {
    $('#organization_applications')
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
        var url =
          '/idm/applications/filtered_organization?role=other&page=' + num;
        var organization_id = $('#select_org').val();
        url = url + '&organization=' + organization_id;
        $.get(url, function(data, status) {
          var table = $('#organization_applications').find(
            '#authorized_table_content'
          );

          table.empty();
          org_create_rows(data.applications, table);
        });
      });
  }
});
