// CSRF functions for AJAX POST requests
var before_send = function(csrf_token) {
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': csrf_token,
    },
  });
};
