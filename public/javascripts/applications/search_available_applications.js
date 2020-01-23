function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function available_applications(input, template, append_table) {
  $('#' + append_table).empty();
  $('#no_available_applications').hide();
  $('#perform_filter_available_applications').hide();
  if (input.length > 1) {
    var url = '/idm/applications/available?key=' + input;
    $('#spinner_available_applications').show('open');
    $.get(url, function(data, status) {
      if (data.applications.length > 0) {
        create_available_application_rows(
          data.applications,
          template,
          append_table
        );
      } else {
        $('#no_available_applications').show();
      }
      $('#spinner_available_applications').hide('close');
    });
  } else if (input.length <= 1) {
    $('#perform_filter_available_applications').show();
  }
}

function create_available_application_rows(
  applications,
  template,
  append_table
) {
  for (var i = 0; i < applications.length; i++) {
    var available_app_row = $('#' + template).html();
    available_app_row = available_app_row.replace(
      /application_name/g,
      htmlEntities(applications[i].name)
    );
    available_app_row = available_app_row.replace(
      /application_id/g,
      String(applications[i].id)
    );
    available_app_row = available_app_row.replace(
      /application_image/g,
      String(applications[i].image)
    );

    $('#' + append_table).append(available_app_row);
  }
}
