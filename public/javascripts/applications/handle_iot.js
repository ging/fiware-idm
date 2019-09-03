// Handle authorize users to the application
$(document).ready(function() {
  // Assign iot sensor to application
  $('#collapse_iot_sensors').on('click', '#register_iot', function(event) {
    // Stop linking
    event.preventDefault();

    // Send ajax request to create pep proxy
    var url = $(this).attr('href');
    var application_id = String(url.split('/')[3]);

    $.get(url, function(result) {
      if (result.iot && result.message.type === 'success') {
        $('#collapse_iot_sensors')
          .find('.show_password')
          .remove();
        var iot = $('#iot_template').html();
        iot = iot.replace(/iot_id/g, result.iot.id);
        iot = iot.replace(/iot_password/g, result.iot.password);
        iot = iot.replace(/application_id/g, application_id);
        $('#collapse_iot_sensors')
          .find('#register_iot')
          .prev()
          .before(iot);

        // Add message
        create_message(result.message.type, result.message.text);
      } else {
        // Add message
        create_message(result.type, result.text);
      }
    });
  });

  // Reset password Iot sensor
  $('#collapse_iot_sensors').on('click', '.reset_password', function(event) {
    // Stop linking
    event.preventDefault();

    // Row of sensor clicked
    var row = $(this).closest('.content_iot');

    // Send ajax request to delete pep proxy
    var url = $(this).attr('href');
    $.get(url, function(result) {
      if (result.iot && result.message.type === 'success') {
        $('#collapse_iot_sensors')
          .find('.show_password')
          .remove();
        var iot = $('#iot_template').html();
        iot = iot.replace(/iot_id/g, result.iot.id);
        iot = iot.replace(/iot_password/g, result.iot.password);
        iot = iot.replace(/application_id/g, result.application.id);
        row.replaceWith(iot);

        // Add message
        create_message(result.message.type, result.message.text);
      } else {
        // Add message
        create_message(result.type, result.text);
      }
    });
  });

  // Delete IoT sensor
  $('#collapse_iot_sensors').on('click', '.delete_iot', function(event) {
    // Stop linking
    event.preventDefault();

    // Row of sensor clicked
    var row = $(this).closest('.content_iot');

    // Send ajax request to delete pep proxy
    var url = $(this).attr('href');

    $.ajax({
      url: url,
      type: 'DELETE',
      beforeSend: before_send($('input:hidden[name=_csrf]').val()),
      success: function(result) {
        if (result.type === 'success') {
          $('#collapse_iot_sensors')
            .find('.show_password')
            .remove();
          row.remove();
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
