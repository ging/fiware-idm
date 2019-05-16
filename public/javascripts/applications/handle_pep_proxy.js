// Handle authorize users to the application
$(document).ready(function() {
  // Assign pep proxy to application
  $('#collapse_pep_proxy').on('click', '#register_pep', function(event) {
    // Stop linking
    event.preventDefault();

    // Send ajax request to create pep proxy
    var url = $(this).attr('href');
    var application_id = String(url.split('/')[3]);

    $.get(url, function(result) {
      if (result.pep && result.message.type === 'success') {
        var pep = $('#pep_proxy_template').html();
        pep = pep.replace(/pep_id/g, result.pep.id);
        pep = pep.replace(/pep_password/g, result.pep.password);
        pep = pep.replace(/application_id/g, application_id);
        $('#collapse_pep_proxy').empty();
        $('#collapse_pep_proxy').append(pep);

        // Add message
        create_message(result.message.type, result.message.text);
      } else {
        // Add message
        create_message(result.type, result.text);
      }
    });
  });

  // Reset password Pep Proxy
  $('#collapse_pep_proxy').on('click', '.reset_password', function(event) {
    // Stop linking
    event.preventDefault();

    // Send ajax request to delete pep proxy
    var url = $(this).attr('href');
    var application_id = String(url.split('/')[3]);

    $.get(url, function(result) {
      if (result.pep && result.message.type === 'success') {
        var pep = $('#pep_proxy_template').html();
        pep = pep.replace(/pep_id/g, result.pep.id);
        pep = pep.replace(/pep_password/g, result.pep.password);
        pep = pep.replace(/application_id/g, application_id);
        $('#collapse_pep_proxy').empty();
        $('#collapse_pep_proxy').append(pep);

        // Add message
        create_message(result.message.type, result.message.text);
      } else {
        // Add message
        create_message(result.type, result.text);
      }
    });
  });

  // Delete Pep Proxy
  $('#collapse_pep_proxy').on('click', '.delete_pep', function(event) {
    // Stop linking
    event.preventDefault();

    // Send ajax request to delete pep proxy
    var url = $(this).attr('href');
    var application_id = String(url.split('/')[3]);

    $.ajax({
      url: url,
      type: 'DELETE',
      beforeSend: before_send($('input:hidden[name=_csrf]').val()),
      success: function(result) {
        if (result.type === 'success') {
          $('#collapse_pep_proxy').empty();
          $('#collapse_pep_proxy').append('<h6 class="panel-heading"></h6>');
          $('#collapse_pep_proxy').append(
            '<a id="register_pep" href="/idm/applications/' +
              application_id +
              '/pep/register/" class="btn btn-default">Register a new PEP Proxy</a>'
          );
        }

        // Add message
        create_message(result.type, result.text);
      },
    });
  });
});

// Function to create messages
function create_message(type, text) {
  var message = $('#message_template').html();
  message = message.replace(/type/g, type);
  message = message.replace(/data/g, text);
  $('.messages').replaceWith(message);
}
