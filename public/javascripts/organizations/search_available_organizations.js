function available_organizations(input, template, append_table) {
  $('#' + append_table).empty();
  $('#perform_filter_available_update_organizations').hide();
  $('#no_available_update_organizations').hide();
  if (input.length > 1) {
    var url = '/idm/organizations/available?key=' + input;
    $('#spinner_update_owners_organizations').show('open');
    $.get(url, function(data, status) {
      if (data.organizations.length > 0) {
        create_organization_rows(data.organizations, template, append_table);
      } else {
        $('#no_available_update_organizations').show();
      }
      $('#spinner_update_owners_organizations').hide('close');
    });
  } else if (input.length <= 1) {
    $('#perform_filter_available_update_organizations').show();
  }
}

function create_organization_rows(organizations, template, append_table) {
  for (var i = 0; i < organizations.length; i++) {
    var organization_row = $('#' + template).html();
    organization_row = organization_row.replace(
      /organization_id/g,
      organizations[i].id
    );
    organization_row = organization_row.replace(
      /organization_avatar/g,
      organizations[i].image
    );
    organization_row = organization_row.replace(
      /organization_name/g,
      htmlEntities(organizations[i].name)
    );

    $('#' + append_table).append(organization_row);
  }
}

function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
