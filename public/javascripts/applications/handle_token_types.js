$(document).ready(function() {
  $('select#select_toke_type').on('changed.bs.select', function() {
    var token_types = $('select#select_toke_type').val();

    if (token_types.includes('jwt')) {
      $('div#jwt_secret').show();
      $('div#token_type').addClass('jwt_type');
    } else {
      $('div#jwt_secret').hide();
      $('div#token_type').removeClass('jwt_type');
    }

    // Send put request
    var put_request = $.ajax({
      url: window.location.pathname + '/token_types/change',
      type: 'PUT',
      beforeSend: before_send($('input:hidden[name=_csrf]').val()),
      data: { token_types: token_types },
    });

    put_request.done(result => {
      if (result.message.type === 'success') {
        if (token_types.includes('jwt')) {
          $('#secret').html(result.jwt_secret);
        }
      }

      // Add message
      create_message(result.message.type, result.message.text);
    });

    put_request.fail(result => {
      // Add message
      create_message(result.message.type, result.message.text);
    });
  });

  $('div#jwt_secret').on('click', 'a.reset_secret', function(event) {
    // Stop linking
    event.preventDefault();

    // Send ajax request to delete pep proxy
    var url = $(this).attr('href');
    $.get(url, function(result) {
      if (result.message.type === 'success') {
        $('#secret').html(result.jwt_secret);
      }

      // Add message
      create_message(result.message.type, result.message.text);
    });
  });
});
