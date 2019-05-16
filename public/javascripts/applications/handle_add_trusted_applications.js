// Handle the authorization of users to be administrators
$(document).ready(function() {
  // Load info when open add trusted application modal
  $('#add_trusted_app_button').click(function() {
    if (trusted_applications.length > 0) {
      for (var i = 0; i < trusted_applications.length; i++) {
        var trusted_app_row = $('#trusted_application_row_template').html();
        trusted_app_row = trusted_app_row.replace(
          /application_name/g,
          htmlEntities(trusted_applications[i].name)
        );
        trusted_app_row = trusted_app_row.replace(
          /application_id/g,
          String(trusted_applications[i].id)
        );
        trusted_app_row = trusted_app_row.replace(
          /application_image/g,
          String(trusted_applications[i].image)
        );
        $('#add_trusted_app')
          .find('#trusted_applications_list')
          .append(trusted_app_row);
      }
    } else {
      $('#no_trusted_applications').show();
    }
  });

  var typingTimerMembers;
  var doneTypingInterval = 500;

  // Send requests to server to obtain organization names and show in available members column
  $('#add_trusted_app')
    .find('#filter_available_applications')
    .bind('keyup input', function(e) {
      var input = $(this).val();
      clearTimeout(typingTimerMembers);
      typingTimerMembers = setTimeout(function() {
        available_applications(
          input,
          'available_application_row_template',
          'available_applications'
        );
      }, doneTypingInterval);
    });

  // Filter admninistrators
  $('#filter_trusted_applications').bind('keyup input', function(e) {
    input = $(this);
    filter = $(this)
      .val()
      .toUpperCase();
    ul = $('#add_trusted_app').find('#trusted_applications_list');
    li = ul.children('li');

    for (i = 0; i < li.length; i++) {
      span = li[i].querySelectorAll('span.name')[0];
      if (span.innerHTML.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = '';
      } else {
        li[i].style.display = 'none';
      }
    }

    if (
      $('#add_trusted_app')
        .find('#trusted_applications_list')
        .children(':visible').length == 0
    ) {
      $('#no_trusted_applications').show();
    } else {
      $('#no_trusted_applications').hide();
    }
  });

  // Change available member to members column
  $('#available_applications').on('click', '.active', function(event) {
    // Stop linking
    event.preventDefault();

    // item of list
    row = $(this).closest('.list-group-item');

    // Id and name of user
    var application_id = row.attr('id');
    var application_name = row.find('.name').html();
    var application_image = row
      .find('.avatar')
      .children('img')
      .first()
      .attr('src');

    var list_trusted = $('#add_trusted_app').find('#trusted_applications_list');

    if (list_trusted.length > 0) {
      $('#no_trusted_applications').hide();
    } else {
      $('#no_trusted_applications').show();
    }

    if (
      $('#add_trusted_app')
        .find('#trusted_applications_list')
        .find('#' + application_id).length
    ) {
      var info_added_app =
        "<span id='info_added_app' style='display: none; text-align: center;' class='help-block alert alert-warning'>Application " +
        application_name +
        ' has been already added</span>';
      $('span#info_added_app').replaceWith(info_added_app);
      $('span#info_added_app')
        .fadeIn(800)
        .delay(300)
        .fadeOut(800);
    } else {
      var trusted_app_row = $('#trusted_application_row_template').html();
      trusted_app_row = trusted_app_row.replace(
        /application_name/g,
        htmlEntities(application_name)
      );
      trusted_app_row = trusted_app_row.replace(
        /application_id/g,
        String(application_id)
      );
      trusted_app_row = trusted_app_row.replace(
        /application_image/g,
        String(application_image)
      );
      $('#add_trusted_app')
        .find('#trusted_applications_list')
        .append(trusted_app_row);

      var info_added_app =
        "<span id='info_added_app' style='display: none; text-align: center;' class='help-block alert alert-success'>Application " +
        application_name +
        ' added</span>';
      $('span#info_added_app').replaceWith(info_added_app);
      $('span#info_added_app')
        .fadeIn(800)
        .delay(300)
        .fadeOut(800);
    }
  });

  // Remove authorized member
  $('.trusted-applications').on('click', '.remove', function(event) {
    // Stop linking
    event.preventDefault();

    // item of list
    row = $(this).closest('.list-group-item');

    // Id and name of user
    var application_id = row.attr('id');
    var application_name = row.find('.name').html();

    var info_added_app =
      "<span id='info_added_app' style='display: none; text-align: center;' class='help-block alert alert-success'>Application " +
      application_name +
      ' removed from application</span>';
    $('span#info_added_app').replaceWith(info_added_app);
    $('span#info_added_app')
      .fadeIn(800)
      .delay(300)
      .fadeOut(800);
    row.fadeOut(500, function() {
      row.remove();
    });
  });

  // Handle the submit button form to submit assignment
  $('#trusted_applications_form').bind('keypress submit', function(event) {
    // stop form from submitting by pressing enter
    if (event.which == 13) {
      event.preventDefault();
    } else if (event.type == 'submit') {
      // stop form from submitting normally
      event.preventDefault();
      var application_ids = [];
      $('#add_trusted_app')
        .find('ul#trusted_applications_list')
        .children()
        .each(function() {
          application_ids.push(this.id);
        });

      $('#submit_trusted').val(JSON.stringify(application_ids));
      $('#trusted_applications_form')[0].submit();
    }
  });

  // Exit from form to authorize users to the application
  $('#add_trusted_app')
    .find('.cancel, .close')
    .click(function() {
      exit_add_trusted_app();
    });

  function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});

// Function to exit from dialog
function exit_add_trusted_app() {
  $('#add_trusted_app')
    .find('#alert_error_search_available')
    .hide();
  $('#add_trusted_app')
    .find('#no_trusted_applications')
    .hide();
  $('#add_trusted_app')
    .find('#no_available_applications')
    .hide('close');
  $('#add_trusted_app')
    .find('#perform_filter_available_applications')
    .show('open');
  $('#add_trusted_app')
    .find('#filter_available_applications')
    .val('');
  $('#add_trusted_app')
    .find('#available_applications')
    .empty();
  $('#add_trusted_app')
    .find('#trusted_applications_list')
    .empty();
  $('#add_trusted_app')
    .find('#filter_trusted_applications')
    .val('');
}
