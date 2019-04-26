$(document).ready(function() {
  // Init some values
  change_role(
    '?tab=panel_tabs__owned_organizations_tab',
    $('#panel_tabs')
      .find('li:first')
      .find('a:first')
  );

  $('.ajax-tabs').on('click', 'li', function() {
    var panel = $(this).find('a:first');

    if (panel.attr('data-loaded') === 'false') {
      $('#spinner_panel_tabs').show();

      var url = panel.attr('href');
      change_role(url, panel);

      $('#spinner_panel_tabs').hide();
    }
  });

  function change_role(url, panel) {
    $.get(url, function(data, status) {
      var table;

      if (url.includes('panel_tabs__owned_organizations_tab')) {
        table = $('#owned_organizations_content');
        owned_organizations(data.number_organizations);
      } else if (url.includes('panel_tabs__member_organizations_tab')) {
        table = $('#member_organizations_content');
        member_organizations(data.number_organizations);
      }

      create_rows(data.organizations, table);
      panel.attr('data-loaded', 'true');
    });
  }

  function create_rows(organizations, table) {
    if (organizations.length > 0) {
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

  function owned_organizations(max) {
    $('#owned_organizations_pagination_container')
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
        var url = '/idm/organizations/filtered?role=owner&page=' + num;
        $.get(url, function(data, status) {
          var table = $('#owned_organizations_content');

          table.empty();
          create_rows(data.organizations, table);
        });
      });
  }

  function member_organizations(max) {
    $('#member_organizations_pagination_container')
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
        var url = '/idm/organizations/filtered?role=member&page=' + num;
        $.get(url, function(data, status) {
          var table = $('#member_organizations_content');

          table.empty();
          create_rows(data.organizations, table);
        });
      });
  }
});
